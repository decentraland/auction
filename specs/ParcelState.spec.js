import { expect } from "chai";

import db from "../src/lib/db";
import { ParcelState } from "../src/lib/models";

describe("ParcelState", function() {
  before(() => db.connect());

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
      const parcelState = {
        x: 1,
        y: 2,
        amount: "20202020",
        address: "0xbeebeef",
        endsAt: new Date(),
        bidGroupId: 1,
        bidIndex: 0
      };
      const insertedParcelState = {
        ...parcelState,
        id: ParcelState.hashId(1, 2)
      };

      let rows = await db.select("parcel_states");
      expect(rows.length).to.equal(0);

      await ParcelState.insert(parcelState);

      rows = await db.select("parcel_states");

      expect(rows.length).to.equal(1);
      expect(rows[0]).to.equalRow(insertedParcelState);
    });
  });

  afterEach(() => db.truncate("parcel_states"));
});
