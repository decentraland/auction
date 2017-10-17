import { Model, utils } from "decentraland-commons";
import signedMessage from "../signedMessage";
import db from "../db";

class BidGroup extends Model {
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

  static async insert(bidGroup) {
    bidGroup = BidGroup.serialize(bidGroup);

    return await db.insert(
      "bid_groups",
      utils.pick(bidGroup, [
        "bids",
        "address",
        "prevId",
        "message",
        "signature",
        "timestamp"
      ])
    );
  }
}

export default BidGroup;
