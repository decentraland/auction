import { expect } from 'chai'

import db from '../src/lib/db'
import { AddressState, BidGroup } from '../src/lib/models'

describe('AddressState', function() {
  const addressState = {
    address: '0xdeadbeef',
    balance: '10000000000000',
    latestBidGroupId: 1
  }

  describe('.insert', function() {
    it('should throw if the address exists', async function() {
      await AddressState.insert(addressState)

      try {
        await AddressState.insert(addressState)
      } catch (error) {
        expect(error.message).to.equal(
          'duplicate key value violates unique constraint "address_states_address_key"'
        )
      }
    })
  })

  describe('.findByAddressWithLastBidGroup', function() {
    it('should return the address state by address', async function() {
      const addressStateToFind = {
        address: '0xdeadbeef22',
        balance: '222222222222',
        latestBidGroupId: null
      }

      await AddressState.insert(addressStateToFind)
      await AddressState.insert(addressState)

      const result = await AddressState.findByAddressWithLastBidGroup(
        addressStateToFind.address
      )
      expect(result).to.equalRow(addressStateToFind)
    })

    it('should attach the bidGroup to the address state', async function() {
      const bidGroup = {
        address: addressState.address,
        bids: [],
        nonce: 0,
        message: 'some message',
        signature: 'some signature',
        receivedAt: new Date()
      }

      await BidGroup.insert(bidGroup)
      await AddressState.insert(addressState)

      const result = await AddressState.findByAddressWithLastBidGroup(
        addressState.address
      )
      expect(result.bidGroup).to.equalRow(bidGroup)
    })

    it('"should attach null if the latestBidGroupId doesn\'t exist"', async function() {
      await AddressState.insert(addressState)

      const result = await AddressState.findByAddressWithLastBidGroup(
        addressState.address
      )
      expect(result.bidGroup).to.be.undefined
    })

    it('should return undefined if the address does not exist on the table', async function() {
      await AddressState.insert(addressState)

      const result = await AddressState.findByAddressWithLastBidGroup(
        '0xnonsense'
      )
      expect(result).to.be.undefined
    })
  })

  describe('findByAddressWithBidGroups', function() {
    it('should attach an array of bid groups for the address', async function() {
      const address = addressState.address
      const bidGroup = {
        address,
        bids: [],
        nonce: 0,
        message: 'some message',
        signature: 'some signature',
        receivedAt: new Date()
      }

      await AddressState.insert(addressState)
      let result = await AddressState.findByAddressWithBidGroups(address)
      expect(result.bidGroups.length).to.be.equal(0)

      await Promise.all([
        BidGroup.insert({ ...bidGroup, message: '0' }),
        BidGroup.insert({ ...bidGroup, message: '1' }),
        BidGroup.insert({ ...bidGroup, message: '2' })
      ])
      result = await AddressState.findByAddressWithBidGroups(address)

      expect(result.bidGroups.length).to.be.equal(3)
      expect(result.bidGroups.map(bg => bg.message)).to.be.deep.equal([
        '0',
        '1',
        '2'
      ])
    })
  })

  afterEach(() =>
    Promise.all(['address_states', 'bid_groups'].map(db.truncate.bind(db)))
  )
})
