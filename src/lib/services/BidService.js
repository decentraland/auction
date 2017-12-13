import { env, eth, utils } from 'decentraland-commons'
import { BidGroup, AddressState, ParcelState } from '../models'

const HOURS_IN_MILLIS = 60 * 60 * 1000
const ERROR_CODES = {
  incompleteData: 'INCOMPLETE_DATA',
  existingId: 'EXISTING_ID',
  invalidNonce: 'INVALID_NONCE',
  invalidTimestamp: 'INVALID_TIMESTAMP',
  parcelErrors: 'PARCEL_ERRORS',
  outOfBounds: 'OUT_OF_BOUNDS',
  insufficientBalance: 'INSUFFICIENT_BALANCE',
  auctionEnded: 'AUCTION_ENDED',
  insufficientIncrement: 'INSUFFICIENT_INCREMENT'
}

const daysFromNowToDate = days => {
  return new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * days)
}

export default class BidService {
  static ERROR_CODES = ERROR_CODES

  constructor() {
    this.BidGroup = BidGroup
    this.AddressState = AddressState
    this.ParcelState = ParcelState

    this.minimumX = getBn(-1e4)
    this.minimumY = getBn(-1e4)

    this.maximumX = getBn(1e4)
    this.maximumY = getBn(1e4)

    this.increment = getBn(1.25)

    this.gracePeriod = 30 * HOURS_IN_MILLIS
  }

  async processBidGroup(bidGroupData) {
    const bidGroupError = await this.getBidGroupValidationError(bidGroupData)
    if (bidGroupError) return { error: bidGroupError } // Break early

    const bidGroup = await this.BidGroup.insert(bidGroupData)

    const addressState = await this.AddressState.findByAddress(bidGroup.address)
    const parcelMap = await this.ParcelState.findInCoordinates(
      bidGroup.bids.map(bid => [bid.x, bid.y])
    )

    const parcelStates = {
      success: {},
      error: {}
    }

    for (let index in bidGroup.bids) {
      const bid = bidGroup.bids[index]
      const parcelId = this.ParcelState.hashId(bid.x, bid.y)
      const parcelState = parcelMap.find(parcel => parcel.id === parcelId)

      const newParceState = this.getNewParcelState(
        addressState,
        parcelState,
        bidGroup,
        +index
      )

      if (newParceState.error) {
        parcelStates.error[parcelId] = newParceState.error
        continue // don't update address state
      }

      parcelStates.success[parcelId] = newParceState

      addressState.balance = this.calculateNewBalance(
        addressState,
        parcelState,
        bidGroup,
        bid
      ).toString()
    }

    const result = { bidGroup: null, error: null }

    if (utils.isEmptyObject(parcelStates.error)) {
      for (let index in bidGroup.bids) {
        const bid = bidGroup.bids[index]
        const parcelId = this.ParcelState.hashId(bid.x, bid.y)
        const parcelState = parcelMap.find(parcel => parcel.id === parcelId)
        if (parcelState.address && parcelState.address !== bidGroup.address) {
          const outbidAddress = await this.AddressState.findByAddress(parcelState.address)
          outbidAddress.balance = getBn(outbidAddress.balance)
            .plus(getBn(parcelState.amount))
            .toString()
          await this.AddressState.update(outbidAddress, { id: outbidAddress.id })
        }
      }

      for (const id in parcelStates.success) {
        await this.ParcelState.update(parcelStates.success[id], { id })
      }

      addressState.latestBidGroupId = bidGroup.id
      await this.AddressState.update(addressState, { id: addressState.id })

      result.bidGroup = bidGroup
    } else {
      result.error = {
        code: ERROR_CODES.parcelErrors,
        parcels: parcelStates.error
      }
    }

    return result
  }

  async getBidGroupValidationError(bidGroup) {
    let validationError = null

    if (this.BidGroup.isIncomplete(bidGroup)) {
      validationError = {
        code: ERROR_CODES.incompleteData
      }
    } else if (await this.BidGroup.findOne(bidGroup.id)) {
      validationError = {
        code: ERROR_CODES.existingId,
        id: bidGroup.id
      }
    } else {
      const latestBid = await this.BidGroup.getLatestByAddress(bidGroup.address)

      if (latestBid) {
        const expectedNonce = latestBid.nonce + 1

        if (expectedNonce !== bidGroup.nonce) {
          validationError = {
            code: ERROR_CODES.invalidNonce,
            address: bidGroup.address,
            latestNonce: latestBid.nonce,
            receivedNonce: bidGroup.nonce
          }
        } else if (latestBid.receivedAt > bidGroup.receivedAt) {
          validationError = {
            code: ERROR_CODES.invalidTimestamp,
            id: bidGroup.id,
            latestReceivedAt: latestBid.receivedAt.getTime(),
            receivedAt: bidGroup.receivedAt.getTime()
          }
        }
      }
    }

    return validationError
  }

  getBidValidationError(addresState, parcelState, bidGroup, bid) {
    let validationError = null

    const x = getBn(bid.x)
    const y = getBn(bid.y)

    if (this.isOutOfBounds(x, y)) {
      validationError = {
        code: ERROR_CODES.outOfBounds,
        bidGroup,
        bid
      }
    } else {
      let newBalance = this.calculateNewBalance(
        addresState,
        parcelState,
        bidGroup,
        bid
      )

      if (newBalance.lessThan(getBn(0))) {
        validationError = {
          code: ERROR_CODES.insufficientBalance
        }
      } else if (this.hasCorrectEndDate(parcelState, bidGroup)) {
        validationError = {
          code: ERROR_CODES.auctionEnded,
          endsAt: parcelState.endsAt.getTime()
        }
      } else if (this.isSufficientIncrement(parcelState, bid)) {
        validationError = {
          code: ERROR_CODES.insufficientIncrement,
          bidAmount: bid.amount,
          parcelAmount: parcelState.amount,
          minimumAmount: this.getParcelIncrement(parcelState).toString()
        }
      }
    }

    return validationError
  }

  isOutOfBounds(x, y) {
    return (
      x.lessThan(this.minimumX) ||
      x.greaterThan(this.maximumX) ||
      y.lessThan(this.minimumY) ||
      y.greaterThan(this.maximumY)
    )
  }

  hasCorrectEndDate(parcelState, bidGroup) {
    return parcelState.endsAt && parcelState.endsAt < bidGroup.receivedAt
  }

  isSufficientIncrement(parcelState, bid) {
    return getBn(bid.amount).lessThan(this.getParcelIncrement(parcelState))
  }

  getParcelIncrement(parcelState) {
    return this.increment.mul(getBn(parcelState.amount))
  }

  calculateNewBalance(addressState, parcelState, bidGroup, bid) {
    if (parcelState.address !== bidGroup.address) {
      return getBn(addressState.balance).minus(getBn(bid.amount))
    }
    return getBn(addressState.balance)
      .minus(getBn(bid.amount))
      .plus(getBn(parcelState.amount))
  }

  getNewParcelState(addresState, parcelState, bidGroup, index) {
    const bid = bidGroup.bids[index]

    const error = this.getBidValidationError(
      addresState,
      parcelState,
      bidGroup,
      bid
    )
    if (error) return { error }

    return {
      id: parcelState.id,
      amount: bid.amount,
      bidGroupId: bidGroup.id,
      bidIndex: index,
      address: bidGroup.address,
      endsAt: this.extendBid(parcelState.endsAt, bidGroup.receivedAt)
    }
  }

  extendBid(endsAt, receivedAt) {
    endsAt = endsAt || daysFromNowToDate(env.get('MIN_GRACE_PERIOD_DAYS', 14))
    receivedAt = receivedAt || new Date()

    const endsTime = endsAt.getTime()
    const receivedTime = receivedAt.getTime() + this.gracePeriod
    const time = Math.max(endsTime, receivedTime)

    return new Date(time)
  }
}

const bnCache = {}
function getBn(number) {
  if (!bnCache[number]) {
    bnCache[number] = new eth.utils.toBigNumber(number)
  }
  return bnCache[number]
}
