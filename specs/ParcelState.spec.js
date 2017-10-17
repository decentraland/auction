import { expect } from "chai";

import db from "../src/lib/db";
import { ParcelState, BidGroup } from "../src/lib/models";

describe("ParcelState", function() {
  before(() => db.connect());

  const parcelState = {
    x: 1,
    y: 2,
    amount: "20202020",
    address: "0xbeebeef",
    endsAt: new Date(),
    bidGroupId: 1,
    bidIndex: 0
  };

  describe(".hashId", function() {
    it("should concat both coordinates with pipes", function() {
      expect(ParcelState.hashId(22, "y coord")).to.equal("22||y coord");
    });

    it("should throw if any coordinate is missing", function() {
      expect(() => ParcelState.hashId(22)).to.throw(
        "You need to supply both coordinates to be able to hash them. x = 22 y = undefined"
      );
      expect(() => ParcelState.hashId(undefined, "y coord")).to.throw(
        "You need to supply both coordinates to be able to hash them. x = undefined y = y coord"
      );
    });
  });

  describe(".insert", function() {
    it("should insert the parcel state hashing the id", async function() {
      const insertedParcelState = {
        ...parcelState,
        id: ParcelState.hashId(parcelState.x, parcelState.y)
      };

      let rows = await db.select("parcel_states");
      expect(rows.length).to.equal(0);

      await ParcelState.insert(parcelState);

      rows = await db.select("parcel_states");

      expect(rows.length).to.equal(1);
      expect(rows[0]).to.equalRow(insertedParcelState);
    });
  });

  describe(".findByIdWithBids", function() {
    it("should attach an array of bid groups for the address", async function() {
      const id = ParcelState.hashId(parcelState.x, parcelState.y)

      const bidGroup = {
        address: "0xbeebeef",
        bids: [],
        message: "some message",
        signature: "some signature",
        timestamp: new Date()
      };

      await ParcelState.insert(parcelState);
      let result = await ParcelState.findByIdWithBids(id);
      expect(result.bidGroups.length).to.be.equal(0);

      await Promise.all([
        await BidGroup.insert({ ...bidGroup, prevId: 0 }),
        await BidGroup.insert({ ...bidGroup, prevId: 1 }),
        await BidGroup.insert({ ...bidGroup, prevId: 2 })
      ]);
      result = await ParcelState.findByIdWithBids(id);

      expect(result.bidGroups.length).to.be.equal(3);
      expect(result.bidGroups.map(bg => bg.prevId)).to.be.deep.equal([0, 1, 2]);
    });
  });

  afterEach(() =>
    Promise.all([db.truncate("parcel_states"), db.truncate("bid_groups")])
  );
});
