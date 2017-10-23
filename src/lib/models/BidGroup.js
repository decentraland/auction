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

  static serialize(attributes, encoding) {
    let { bids, message, signature } = attributes;
    let bidGroup = Object.assign({}, attributes);

    if (typeof bids !== "string") bidGroup.bids = JSON.stringify(bids);

    if (message && signature) {
      bidGroup = signedMessage.serialize(bidGroup, encoding);
    }

    return bidGroup;
  }

  static deserialize(attributes, encoding) {
    let { receivedTimestamp, bids, message, signature } = attributes;
    let bidGroup = Object.assign({}, attributes);

    if (typeof bidGroup.bids === "string") bidGroup.bids = JSON.parse(bids);

    if (typeof receivedTimestamp === "string") {
      bidGroup.receivedTimestamp = new Date(receivedTimestamp);
    }

    if (message && signature) {
      bidGroup = signedMessage.deserialize(bidGroup, encoding);
    }

    return bidGroup;
  }

  static deserializeJoinedRows(rows) {
    return rows
      .filter(row => !!row.bidGroup)
      .map(row => BidGroup.deserialize(row.bidGroup, "bytea"));
  }

  static async getLatestByAddress(address) {
    return await this.findOne({ address }, { receivedTimestamp: "DESC" });
  }

  static async insert(bidGroup) {
    let inserted = await super.insert(this.serialize(bidGroup));
    inserted = this.deserialize(inserted);

    for (let [index, bid] of Object.entries(inserted.bids)) {
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
