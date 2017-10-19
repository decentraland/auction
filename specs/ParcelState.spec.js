import { expect } from "chai";

import db from "../src/lib/db";
import { ParcelState, BidGroup } from "../src/lib/models";
import { ParcelStateService } from "../src/lib/services";

describe("ParcelState", function() {
  before(() => db.connect());

  const parcelState = {
    x: 1,
    y: 2,
    amount: "20202020",
    address: "0xbeebeef",
    endsAt: new Date(),
    bidGroupId: 1,
    bidIndex: 0,
    projectId: null
  };

  describe(".hashId", function() {
    it("should concat both coordinates with pipes", function() {
      expect(ParcelState.hashId(22, "30")).to.equal("22,30");
      expect(ParcelState.hashId(0, 0)).to.equal("0,0");
    });

    it("should throw if any coordinate is invalid", function() {
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

  describe(".findByIdWithBidGroups", function() {
    it("should attach an array of bid groups for the address", async function() {
      const id = ParcelState.hashId(parcelState.x, parcelState.y);

      const bidGroup = {
        address: "0xbeebeef",
        bids: [],
        nonce: 0,
        message: "some message",
        signature: "some signature",
        receivedTimestamp: new Date()
      };

      await ParcelState.insert(parcelState);
      let result = await ParcelState.findByIdWithBidGroups(id);
      expect(result.bidGroups.length).to.be.equal(0);

      await Promise.all([
        BidGroup.insert({ ...bidGroup, message: "0" }),
        BidGroup.insert({ ...bidGroup, message: "1" }),
        BidGroup.insert({ ...bidGroup, message: "2" })
      ]);
      result = await ParcelState.findByIdWithBidGroups(id);

      expect(result.bidGroups.length).to.be.equal(3);
      expect(result.bidGroups.map(bg => bg.message)).to.be.deep.equal([
        "0",
        "1",
        "2"
      ]);
    });
  });

  describe(".findInCoordinates", function() {
    it("should attach an array of bid groups for the address", async function() {
      await new ParcelStateService(ParcelState).insertMatrix(3, 3);

      const result = await ParcelState.findInCoordinates([
        "1,2",
        "3,3",
        "4,4",
        "0,0"
      ]);

      expect(result.length).to.be.equal(3);
    });

    it("should throw if any coordinate is invalid", function() {
      ParcelState.findInCoordinates(["1,1", "nonsense"]).catch(error =>
        expect(error.message).to.equal(
          'The coordinate "nonsense" are not valid'
        )
      );
    });
  });

  describe(".inRange", function() {
    it("should return an array of parcel states which are on the supplied range", async function() {
      await new ParcelStateService(ParcelState).insertMatrix(10, 10);

      const range = await ParcelState.inRange([2, 3], [5, 5]);
      const coordinates = range.map(ps => `${ps.x},${ps.y}`);

      expect(range.length).to.be.equal(12);
      expect(coordinates).to.be.deep.equal([
        "2,3",
        "2,4",
        "2,5",
        "3,3",
        "3,4",
        "3,5",
        "4,3",
        "4,4",
        "4,5",
        "5,3",
        "5,4",
        "5,5"
      ]);
    });
  });

  afterEach(() =>
    Promise.all([db.truncate("parcel_states"), db.truncate("bid_groups")])
  );
});
