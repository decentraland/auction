import { expect } from "chai";

import db from "../src/lib/db";
import { AddressState } from "../src/lib/models";

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
    it("Should return the address state by address", async function() {
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

    it("Should return undefined if the address does not exist on the table", async function() {
      await AddressState.insert(addressState);

      const result = await AddressState.findByAddress("0xnonsense");
      expect(result).to.be.undefined;
    });
  });

  afterEach(() => db.truncate("address_states"));
});
