import { expect } from "chai";
import db from "../../src/lib/db";

describe("Describe", function() {
  before(() => db.connect());

  describe("#insertAddressState", function() {
    const addressState = {
      address: "0xdeadbeef",
      balance: "10000000000000",
      lastBidGroupId: 1
    };

    it("should insert the address state on the database", async function() {
      let rows = await db.select("address_states");
      expect(rows.length).to.equal(0);

      await db.insertAddressState(addressState.address, addressState);

      rows = await db.select("address_states");
      expect(rows.length).to.equal(1);
      expect(rows[0]).to.containSubset(addressState); // it also has id and created/updated at cols
    });

    it("should throw if the address exists", async function() {
      await db.insertAddressState(addressState.address, addressState);

      try {
        await db.insertAddressState(addressState.address, addressState);
      } catch (error) {
        expect(error.message).to.equal(
          'duplicate key value violates unique constraint "address_states_address_key"'
        );
      }
    });
  });

  afterEach(() => db.truncate("address_states"));
});
