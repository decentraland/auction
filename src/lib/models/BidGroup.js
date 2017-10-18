import { Model } from "decentraland-commons";
import signedMessage from "../signedMessage";

class BidGroup extends Model {
  static tableName = "bid_groups";
  static columnNames = [
    "bids",
    "address",
    "nonce",
    "message",
    "signature",
    "timestamp"
  ];

  static serialize(bidGroup, encoding) {
    bidGroup = signedMessage.serialize(bidGroup);
    bidGroup.bids = JSON.stringify(bidGroup.bids);
    return bidGroup;
  }

  static deserialize(bidGroup, encoding) {
    bidGroup = signedMessage.deserialize(bidGroup, encoding);

    if (typeof bidGroup.timestamp === "string") {
      bidGroup.timestamp = new Date(bidGroup.timestamp);
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
      { timestamp: "DESC" }
    );
  }

  static async insert(bidGroup) {
    bidGroup = BidGroup.serialize(bidGroup);
    return await super.insert(bidGroup);
  }
}

export default BidGroup;
