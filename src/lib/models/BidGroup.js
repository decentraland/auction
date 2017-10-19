import { Model } from "decentraland-commons";
import Bid from "./Bid";
import signedMessage from "../signedMessage";

class BidGroup extends Model {
  static tableName = "bid_groups";
  static columnNames = [
    "bids",
    "address",
    "nonce",
    "message",
    "signature",
    "receivedTimestamp"
  ];

  static serialize(bidGroup, encoding) {
    bidGroup = signedMessage.serialize(bidGroup);
    bidGroup.bids = JSON.stringify(bidGroup.bids);
    return bidGroup;
  }

  static deserialize(bidGroup, encoding) {
    bidGroup = signedMessage.deserialize(bidGroup, encoding);

    if (typeof bidGroup.receivedTimestamp === "string") {
      bidGroup.receivedTimestamp = new Date(bidGroup.receivedTimestamp);
    }

    return bidGroup;
  }

  static deserializeJoinedRows(rows) {
    return rows
      .filter(row => !!row.bidGroup)
      .map(row => BidGroup.deserialize(row.bidGroup, "bytea"));
  }

  static async getLatestByAddress(address) {
    return await this.db.selectOne(
      this.tableName,
      { address },
      { receivedTimestamp: "DESC" }
    );
  }

  static async insert(bidGroup) {
    const inserted = await super.insert(BidGroup.serialize(bidGroup));

    for (let [index, bid] of Object.entries(bidGroup.bids)) {
      bid = Object.assign(
        { bidIndex: index, bidGroupId: inserted.id },
        bid,
        bidGroup
      );
      await Bid.insert(bid);
    }

    return inserted;
  }
}

export default BidGroup;
