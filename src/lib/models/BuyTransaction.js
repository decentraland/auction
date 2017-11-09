import { Model } from "decentraland-commons";

class BuyTransaction extends Model {
  static tableName = "buy_transactions";
  static columnNames = [
    "id",
    "txId",
    "address",
    "parcelStatesIds",
    "totalCost",
    "status",
    "receipt"
  ];

  static findProcessedParcels(address) {
    return this.db
      .query(
        "SELECT UNNEST(\"parcelStatesIds\") AS id FROM buy_transactions WHERE status IN ('completed', 'pending') AND address = $1",
        [address]
      )
      .then(rows => rows.map(row => row.id));
  }
}

export default BuyTransaction;
