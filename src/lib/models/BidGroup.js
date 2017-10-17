import { Model } from "decentraland-commons";
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

  static async insert(bidGroup) {
    const {
      bids,
      address,
      prevId,
      message,
      signature,
      timestamp
    } = BidGroup.serialize(bidGroup);

    return await db.insert("bid_groups", {
      bids,
      address,
      prevId,
      message,
      signature,
      timestamp
    });
  }
}

export default BidGroup;
