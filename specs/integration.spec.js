import { expect } from "chai";
import { eth } from "decentraland-commons";

import db from "../src/lib/db";
import { postBidGroup } from "../src/server";

describe("server", function() {
  before(() => Promise.all([db.connect(), eth.connect()]));

  describe("POST /api/bidgroup", function() {
    it("should insert the BidGroup *and* BidReceipt in the database, returning true if the operation was successfull", async function() {
      const bidGroup = {
        address: "0xdeadbeef",
        bids: JSON.stringify([
          { x: 1, y: 2, amount: "1000000" },
          { x: 5, y: 2, amount: "333333" }
        ]),
        nonce: 0,
        message: "this-is-the-message",
        signature: "this-is-the-signature"
        // receivedTimestamp added by the server
      };

      const req = {
        headers: {
          "content-type": "application/json"
        },
        body: {
          bidGroup: JSON.stringify(bidGroup)
        },
        query: {},
        params: {}
      };

      await postBidGroup(req);

      const bidGroups = await db.select("bid_groups");
      const bids = await db.select("bids");
      const bidReceipts = await db.select("bid_receipts");

      expect(bidGroups.length).to.be.equal(1);
      expect(bids.length).to.be.equal(2);
      expect(bidReceipts.length).to.be.equal(1);
    });
  });

  afterEach(() =>
    Promise.all(
      ["bid_groups", "bids", "bid_receipts"].map(db.truncate.bind(db))
    )
  );
});
