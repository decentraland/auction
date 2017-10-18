import { Model } from "decentraland-commons";

class Bid extends Model {
  static tableName = "bid";
  static columnNames = [
    "x",
    "y",
    "bidgroup",
    "bidindex",
    "address",
    "timpestamp",
    "amount"
  ];

  static findInBidGroup(bidGroupId, index) {
    return this.db.selectOne(this.tableName, { bidGroupId, index });
  }
}

export default Bid;
