import { expect } from "chai";

import db from "../src/lib/db";
import { BidGroup } from "../src/lib/models";

describe("BidGroup", function() {
  before(() => db.connect());

  describe(".insert", function() {
    it("should insert the bidGroup serializing the necessary columns", async function() {
      const bidGroup = {
        address: "0xbeefdead",
        bids: [
          {
            x: 1,
            y: 2
          }
        ],
        prevId: 0,
        timestamp: new Date(),
        message: "some message",
        signature: "02md0dsdffuntimes"
      };
      const serializedBidGroup = {
        ...bidGroup,
        message: Buffer.from(bidGroup.message, "utf8"),
        signature: Buffer.from(bidGroup.signature, "utf8")
      };

      let rows = await db.select("bid_groups");
      expect(rows.length).to.equal(0);

      await BidGroup.insert(bidGroup);

      rows = await db.select("bid_groups");

      expect(rows.length).to.equal(1);
      expect(rows[0]).to.containSubset(serializedBidGroup); // it also has id and created/updated at cols
    });
  });

  afterEach(() => db.truncate("bid_groups"));
});
