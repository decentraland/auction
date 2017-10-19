import { Model } from "decentraland-commons";
import signedMessage from "../signedMessage";

class BidReceipt extends Model {
  static tableName = "bid_receipts";
  static columnNames = ["timeReceived", "bidGroupId", "message", "signature"];

  static serialize(bidRecepeit, encoding) {
    return signedMessage.serialize(bidRecepeit, encoding);
  }

  static deserialize(bidRecepeit, encoding) {
    return signedMessage.deserialize(bidRecepeit, encoding);
  }
}

export default BidReceipt;
