import { Model } from "decentraland-commons";
import signedMessage from "../signedMessage";

class BidReceipt extends Model {
  static tableName = "bid_receipts";
  static columnNames = [
    "receivedAt",
    "bidGroupId",
    "message",
    "signature"
  ];

  static serialize(attributes, encoding) {
    let { message, signature } = attributes;
    let bidReceipt = Object.assign({}, attributes);

    if (message && signature) {
      bidReceipt = signedMessage.serialize(bidReceipt, encoding);
    }

    return bidReceipt;
  }

  static deserialize(attributes, encoding) {
    let { message, signature } = attributes;
    let bidReceipt = Object.assign({}, attributes);

    if (message && signature) {
      bidReceipt = signedMessage.deserialize(bidReceipt, encoding);
    }

    return bidReceipt;
  }

  static async insert(bidReceipt) {
    let inserted = await super.insert(this.serialize(bidReceipt));
    return this.deserialize(inserted);
  }
}

export default BidReceipt;
