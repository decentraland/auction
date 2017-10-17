import { expect } from "chai";

import db from "../src/lib/db";
import { AddressState, BidGroup } from "../src/lib/models";

describe("AddressState", function() {
  before(() => db.connect());

  const addressState = {
    address: "0xdeadbeef",
    balance: "10000000000000",
    lastBidGroupId: 1
  };

  describe("#insert", function() {
    it("should insert the address state on the database", async function() {
      let rows = await db.select("address_states");
      expect(rows.length).to.equal(0);

      await AddressState.insert(addressState);

      rows = await db.select("address_states");

      expect(rows.length).to.equal(1);
      expect(rows[0]).to.containSubset(addressState); // it also has id and created/updated at cols
    });

    it("should throw if the address exists", async function() {
      await AddressState.insert(addressState);

      try {
        await AddressState.insert(addressState);
      } catch (error) {
        expect(error.message).to.equal(
          'duplicate key value violates unique constraint "address_states_address_key"'
        );
      }
    });
  });

  describe("#findByAddress", function() {
    it("should return the address state by address", async function() {
      const addressStateToFind = {
        address: "0xdeadbeef22",
        balance: "222222222222"
      };

      await AddressState.insert(addressStateToFind);
      await AddressState.insert(addressState);

      const result = await AddressState.findByAddress(
        addressStateToFind.address
      );
      expect(result).to.containSubset(addressStateToFind);
    });

    it("should attach the bidGroup to the address state", async function() {
      const bidGroup = {
        address: addressState.address,
        bids: [],
        prevId: 0,
        message: "some message",
        signature: "some signature",
        timestamp: new Date()
      };

      await BidGroup.insert(bidGroup);
      await AddressState.insert(addressState);

      const result = await AddressState.findByAddress(addressState.address);
      expect(result.bidGroup).to.containSubset(bidGroup);
    });

    it("should attach null if the lastBidGroupId doesn't exist", async function() {
      await AddressState.insert(addressState);

      const result = await AddressState.findByAddress(addressState.address);
      expect(result.bidGroup).to.be.undefined;
    });

    it("should return undefined if the address does not exist on the table", async function() {
      await AddressState.insert(addressState);

      const result = await AddressState.findByAddress("0xnonsense");
      expect(result).to.be.undefined;
    });
  });

  describe("findByAddressWithBids", function() {
    it("should attach an array of bid groups for the address", async function() {
      const address = addressState.address;
      const bidGroup = {
        address,
        bids: [],
        message: "some message",
        signature: "some signature",
        timestamp: new Date()
      };

      await AddressState.insert(addressState);
      let result = await AddressState.findByAddressWithBids(address);
      expect(result.bidGroups.length).to.be.equal(0);

      await Promise.all([
        await BidGroup.insert({ ...bidGroup, prevId: 0 }),
        await BidGroup.insert({ ...bidGroup, prevId: 1 }),
        await BidGroup.insert({ ...bidGroup, prevId: 2 })
      ]);
      result = await AddressState.findByAddressWithBids(address);

      expect(result.bidGroups.length).to.be.equal(3);
      expect(result.bidGroups.map(bg => bg.prevId)).to.be.deep.equal([0, 1, 2]);
    });
  });

  afterEach(() =>
    Promise.all([db.truncate("address_states"), db.truncate("bid_groups")])
  );
});
