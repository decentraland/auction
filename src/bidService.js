export default class BidService {
  constructor(BidGroupModel, AddressStateModel) {
    this.BidGroup = BidGroupModel
    this.AddressState = AddressStateModel

    this.minimumX = -1e4
    this.minimumY = -1e4

    this.maximumX = 1e4
    this.maximumY = 1e4
  }

  async processBidGroup(bidGroup) {
    const bidGroupError = await this.getBidGroupValidationError(bidGroupError)
    if (bidGroupError) {
      return { error: bidGroupError }
    }
    const addressState = await this.AddressStateModel.getFullState(bidGroup.address)
    const parcelMap = await this.ParcelStateModel.getParcelStates(bidGroup.bids.map(bid => [ bid.x, bid.y ]))
    const results = []
    for (let index in bidGroup.bids) {
      const bid = bidGroup.bids[index]
      const newState = this.getNewParcelState(addressState, parcelMap[bid.x][bid.y], bidGroup, index)
      if (newState.error) {
        results.push(newState)
      }
      if (parcelMap[bid.x][bid.y].address === bidGroup.address) {
        addressState.balance += parcelMap[bid.x][bid.y].amount
      }
      addressState.balance -= newState.amount
      parcelMap[bid.x][bid.y] = newState
      await this.ParcelStateModel.updateParcelState(newState)
      results.push(newState)
    }
    addressState.latestBid = bidGroup.id
    await this.AddressStateModel.updateState(addressState)
    return results
  }

  async checkValidBidGroup(bidGroup) {
    const validationError = this.getValidationError(bidGroup)
    if (validationError) {
      throw new Error(validationError)
    }
  }

  async getBidGroupValidationError(bidGroup) {
    if (await this.BidGroup.findOne(bidGroup.id)) {
      return (`Id ${bidGroup.id} already exists in database`)
    }
    const latestBid = this.BidGroup.latestBid(bidGroup.address)
    if (latestBid) {
      const latestNonce = bidGroup.nonce
      if (latestNonce !== bidGroup.nonce - 1) {
        return (`Invalid nonce for ${address}: stored ${latestNonce}, received ${bidGroup.nonce}`)
      }
      if (latestBid.receivedTimestamp > bidGroup.receivedTimestamp) {
        return (`Invalid timestamp for BidGroup received ${bidGroup.id}:
          latest was ${latestBid.receivedTimestamp}, received ${bidGroup.receivedTimestamp}`
        )
      }
    }
    return null
  }

  getBidValidationError(fullAddressState, parcelState, bidGroup, index) {
    const bid = bidGroup[index]
    if (bid.x < this.minimumX || bid.x > this.maximumX) {
      return `Invalid X coordinate for bid ${index} of bidGroup ${bidGroup.id}:
        ${bid.x} is not between ${this.minimumX} and ${this.maximumX}`
    }
    if (bid.y < this.minimumY || bid.y > this.maximumY) {
      return `Invalid Y coordinate for bid ${index} of bidGroup ${bidGroup.id}:
        ${bid.y} is not between ${this.minimumY} and ${this.maximumY}`
    }
    let newBalance = addressState.balance - bid.amount
    if (parcelState) {
      if (parcelState.address == bidGroup.address) {
        newBalance += parcelState.amount
      }
    }
    if (newBalance < 0) {
      return `Insufficient balance to participate in the bid`
    }
    if (parcelState) {
      if (parcelState.endsAt < bidGroup.receivedTimestamp) {
        return `Auction ended at ${parcelState.endsAt}`
      }
      if (bid.amount < this.increment * parcelState.amount) {
        return `Insufficient increment from ${parcelState.amount} to ${bid.amount}`
      }
    }
    return null
  }

  getNewParcelState(fullAddressState, parcelState, bidGroup, index) {
    const error = this.getBidValidationError(fullAddressState, parcelState, bidGroup, index)
    if (error) {
      return { error }
    }
    const bid = bidGroup[index]
    return {
      amount: bid.amount,
      bidGroup: bidGroup.id,
      bidIndex: index,
      address: bidGroup.address,
      endsAt: extendBid(parcelState, bidGroup.receivedTimestamp)
    }
  }
}
