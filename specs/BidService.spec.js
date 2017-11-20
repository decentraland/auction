import { expect } from 'chai'
import sinon from 'sinon'

import { BidService } from '../src/lib/services'

const noop = () => undefined
const identity = x => x

const TIMESTAMP = 1507399991050000
const DATE_TIMESTAMP = new Date(TIMESTAMP)

describe('BidService', function() {
  let bidService
  let BidGroup
  let AddressState
  let ParcelState

  beforeEach(() => {
    BidGroup = {
      findOne: noop,
      getLatestByAddress: noop,
      isIncomplete: noop,
      insert: identity
    }
    AddressState = { findByAddress: noop, update: noop }
    ParcelState = { hashId: identity, findInCoordinates: noop, update: noop }

    bidService = new BidService()
    bidService.BidGroup = BidGroup
    bidService.AddressState = AddressState
    bidService.ParcelState = ParcelState
  })

  describe('getBidValidationError', function() {
    it('should reject incomplete BidGroups', async function() {
      const bidGroup = {
        bids: '[]',
        nonce: 0
      }

      sinon
        .stub(BidGroup, 'isIncomplete')
        .withArgs(sinon.match(bidGroup))
        .returns(true)

      expect(await bidService.getBidGroupValidationError(bidGroup)).to.equal(
        'The BidGroup seems to be invalid, it should have defined all the columns to be inserted.'
      )
    })

    it('should reject a BidGroup with a matching id', async function() {
      const clashingId = 1

      sinon
        .stub(BidGroup, 'findOne')
        .withArgs(clashingId)
        .returns({ id: clashingId })

      expect(
        await bidService.getBidGroupValidationError({ id: clashingId })
      ).to.equal(`Id ${clashingId} already exists in database`)
    })

    it('should reject a BidGroup with an invalid nonce', async function() {
      const id = 1
      const address = '0xdeadbeef'

      sinon
        .stub(BidGroup, 'findOne')
        .withArgs(id)
        .returns(null)

      sinon
        .stub(BidGroup, 'getLatestByAddress')
        .withArgs(address)
        .returns({ nonce: 2 })

      const bidGroupValue = {
        id,
        nonce: 1,
        address
      }
      expect(
        await bidService.getBidGroupValidationError(bidGroupValue)
      ).to.equal(`Invalid nonce for ${address}: stored 2, received 1`)
    })

    it('should reject a BidGroup with an invalid date', async function() {
      const id = 1
      const address = '0xdeadbeef'

      sinon
        .stub(BidGroup, 'findOne')
        .withArgs(id)
        .returns(null)

      sinon
        .stub(BidGroup, 'getLatestByAddress')
        .withArgs(address)
        .returns({ nonce: 2, receivedAt: DATE_TIMESTAMP })

      const bidGroupValue = {
        id,
        nonce: 3,
        receivedAt: new Date(TIMESTAMP - 10000),
        address
      }

      expect(
        await bidService.getBidGroupValidationError(bidGroupValue)
      ).to.equal(
        `Invalid timestamp for BidGroup received ${id}: latest was 1507399991050000, received 1507399991040000`
      )
    })
  })

  describe('getBidValidationError', () => {
    let address, parcel, bidGroup, index

    beforeEach(() => {
      address = { address: '0xc0ffee', balance: '200' }
      parcel = { endsAt: DATE_TIMESTAMP, amount: 100, address: '0xdeadbeef' }
      bidGroup = {
        id: 'bidgroup',
        bids: [
          {
            x: 0,
            y: 0,
            amount: 110
          }
        ],
        receivedAt: DATE_TIMESTAMP
      }
      index = 0
    })

    it('should reject an invalid x coordinate', () => {
      bidGroup.bids[0].x = -10001
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal(
        'Invalid X coordinate for bid 0 of bidGroup bidgroup: -10001 is not between -10000 and 10000'
      )
      bidGroup.bids[0].x = 10001
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal(
        'Invalid X coordinate for bid 0 of bidGroup bidgroup: 10001 is not between -10000 and 10000'
      )
    })
    it('should reject an invalid y coordinate', () => {
      bidGroup.bids[0].y = -10001
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal(
        'Invalid Y coordinate for bid 0 of bidGroup bidgroup: -10001 is not between -10000 and 10000'
      )
      bidGroup.bids[0].y = 10001
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal(
        'Invalid Y coordinate for bid 0 of bidGroup bidgroup: 10001 is not between -10000 and 10000'
      )
    })
    it('should reject a bid with insufficient balance', () => {
      address.balance = 10
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal('Insufficient balance to participate in the bid')
    })
    it('should not reject a bid with just enough balance to increase amount bid', () => {
      address.balance = 10
      parcel.address = bidGroup.address
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal(null)
    })
    it('should reject a bid if the auction ended', () => {
      parcel.endsAt = new Date(TIMESTAMP - 5000)
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal('Auction ended at 1507399991045000')
    })
    it('should enforce a 10% increase minimum', () => {
      bidGroup.bids[0].amount = 101
      expect(
        bidService.getBidValidationError(address, parcel, bidGroup, index)
      ).to.equal('Insufficient increment from 100 to 101')
    })
  })

  describe('processBidGroup', () => {
    it('returns an object with "error" if validation of group fails', async () => {
      const id = 1
      sinon
        .stub(BidGroup, 'findOne')
        .withArgs(id)
        .returns({ id })
      expect(await bidService.processBidGroup({ id })).to.deep.equal({
        error: `Id ${id} already exists in database`
      })
    })
    it('calls updates correctly', async () => {
      const id = 1
      const address = '0xdeadbeef'
      const endsAt = new Date(TIMESTAMP + 5000)
      const receivedAt = DATE_TIMESTAMP

      sinon
        .stub(BidGroup, 'findOne')
        .withArgs(id)
        .returns(null)

      sinon
        .stub(BidGroup, 'getLatestByAddress')
        .withArgs(address)
        .returns({ nonce: 2, receivedAt })

      sinon
        .stub(AddressState, 'findByAddress')
        .withArgs(address)
        .returns({ nonce: 2, balance: 200 })

      sinon
        .stub(ParcelState, 'findInCoordinates')
        .returns([{ id: '0,0', x: 0, y: 0, amount: 100, endsAt }])

      sinon
        .stub(ParcelState, 'update')
        .returns({ x: 0, y: 0, amount: 100, address: '0xc0ffee' })

      sinon.stub(ParcelState, 'hashId').returns('0,0')

      sinon.stub(AddressState, 'update').returns({ nonce: 2 })

      const bidGroupValue = {
        id,
        nonce: 3,
        receivedAt,
        address,
        bids: [
          {
            x: 0,
            y: 0,
            amount: 110
          }
        ]
      }

      expect(await bidService.processBidGroup(bidGroupValue)).to.deep.equal({
        bidGroup: bidGroupValue,
        parcelStates: [
          {
            id: '0,0',
            address,
            amount: 110,
            bidGroup: id,
            bidIndex: 0,
            endsAt: new Date(TIMESTAMP + 129600000)
          }
        ]
      })
    })
  })
})
