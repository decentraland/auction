import sinon from 'sinon'
import { expect } from 'chai'

import { postBidGroup } from '../src/server'
import { BidGroup, BidReceipt, AddressState } from '../src/lib/models'
import { ParcelStateService } from '../src/lib/services'
import db from '../src/lib/db'

describe('server', function() {
  describe('POST /api/bidgroup', function() {
    let receivedAt
    let clock

    before(() => {
      // `receivedAt` is added by the server, so we return a fixed value.
      // Don't forget to restore the clock at the end!
      const timestamp = 1507399991050000
      receivedAt = new Date(timestamp)
      clock = sinon.useFakeTimers(receivedAt)
    })

    it('should insert the BidGroup *and* BidReceipt in the database, returning true if the operation was successfull', async function() {
      const addressState = {
        address: '0xdeadbeef',
        balance: '2033333'
      }
      const bidGroup = {
        address: addressState.address,
        bids: [
          { x: 1, y: 2, amount: '1000000' },
          { x: 5, y: 2, amount: '333333' }
        ],
        nonce: 0,
        message: 'this-is-the-message',
        signature: 'this-is-the-signature',
        receivedAt
      }

      const req = {
        headers: {
          'content-type': 'application/json'
        },
        body: {
          bidGroup: JSON.stringify(bidGroup)
        },
        query: {},
        params: {}
      }

      const bids = bidGroup.bids.map((bid, index) =>
        Object.assign(
          {
            address: bidGroup.address,
            bidGroupId: 1,
            bidIndex: index,
            receivedAt
          },
          bid
        )
      )

      const bidReceipt = {
        bidGroupId: 1,
        message: `1||${receivedAt.getTime()}||this-is-the-message`,
        signature:
          '003113fbe8cc559c3f5ef9a79dddeebc86e942fafb729d0220fff12a34cdefd5||6bee34cd9665f17fdf72022ee7282a2b85517c86c3b69cbbbc3fcce378a8ab1e||28',
        receivedAt
      }

      await AddressState.insert(addressState)
      await new ParcelStateService().insertMatrix(0, 0, 6, 6)

      await postBidGroup(req)

      const dbBidGroups = await db.select('bid_groups')
      const dbBids = await db.select('bids')
      const dbBidReceipts = await db.select('bid_receipts')
      const dbAddressState = await db.select('address_states')
      const dbBidGroup = dbBidGroups[0]
      const dbBidReceipt = dbBidReceipts[0]

      expect(dbBidGroups.length).to.be.equal(1)
      expect(BidGroup.deserialize(dbBidGroup)).to.be.equalRow(bidGroup)

      expect(dbBids.length).to.be.equal(2)
      expect(dbBids).to.be.equalRows(bids)

      expect(dbBidReceipts.length).to.be.equal(1)
      expect(BidReceipt.deserialize(dbBidReceipt)).to.equalRow(bidReceipt)

      expect(dbAddressState[0]).to.equalRow({
        address: addressState.address,
        balance: '700000',
        latestBidGroupId: 1
      })
    })

    after(() => clock.restore())
  })

  afterEach(() =>
    Promise.all(
      [
        'bid_groups',
        'bids',
        'bid_receipts',
        'parcel_states',
        'address_states'
      ].map(db.truncate.bind(db))
    )
  )
})
