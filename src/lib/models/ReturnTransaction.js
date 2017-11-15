import { eth, Model } from "decentraland-commons";

class ReturnTransaction extends Model {
  static tableName = "return_transactions";
  static columnNames = [
    "id",
    "txId",
    "address",
    "amount",
    "status",
    "receipt"
  ];

  static findByAddress(address) {
    return this.findOne({ address });
  }
}

export default ReturnTransaction;
