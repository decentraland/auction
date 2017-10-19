import { expect } from "chai";

import db from "../src/lib/db";
import { BidGroup } from "../src/lib/models";

describe("BidGroup", function() {
  before(() => db.connect());

  describe(".insert", function() {
    it("should insert the bidGroup serializing the necessary columns", async function() {
      const bidGroup = {
        address: "0xbeefdead",
        bids: [{ x: 1, y: 2, amount: "10000" }],
        nonce: 1,
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
      expect(rows[0]).to.equalRow(serializedBidGroup);
    });

    it("should insert the inner bids", async function() {
      const bids = [
        { x: 1, y: 2, amount: "11000" },
        { x: 3, y: 3, amount: "20000" },
        { x: 5, y: 10, amount: "300000" }
      ];
      let bidGroup = {
        bids,
        address: "0xbeefdead",
        nonce: 1,
        timestamp: new Date(),
        message: "some message",
        signature: "02md0dsdffuntimes"
      };

      let rows = await db.select("bids");
      expect(rows.length).to.equal(0);

      bidGroup = await BidGroup.insert(bidGroup);

      const bidBase = {
        timestamp: bidGroup.timestamp,
        bidGroupId: bidGroup.id,
        address: bidGroup.address
      };

      rows = await db.select("bids");

      expect(rows.length).to.equal(3);

      bids.forEach((bid, index) => {
        expect(rows[index]).to.equalRow({
          ...bidBase,
          ...bid,
          bidIndex: index
        });
      });
    });
  });

  afterEach(() =>
    Promise.all([db.truncate("bid_groups"), db.truncate("bids")])
  );
});
