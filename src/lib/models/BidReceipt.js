import { Model } from "decentraland-commons";

class BidReceipt extends Model {
  static tableName = "bid_receipts";
  static columnNames = [
    "timeReceived",
    "messageHash",
    "serverSignature",
    "serverMessage"
  ];
}

export default BidReceipt;
