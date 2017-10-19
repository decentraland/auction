import { Model } from "decentraland-commons";

class Bid extends Model {
  static tableName = "bids";
  static columnNames = [
    "x",
    "y",
    "bidGroupId",
    "bidIndex",
    "address",
    "receivedTimestamp",
    "amount"
  ];

  static findInBidGroup(bidGroupId, index) {
    return this.db.selectOne(this.tableName, { bidGroupId, index });
  }
}

export default Bid;
