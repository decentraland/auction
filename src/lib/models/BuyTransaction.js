import { Model } from "decentraland-commons";

class BuyTransaction extends Model {
  static tableName = "buy_transactions";
  static columnNames = [
    "id",
    "txId",
    "address",
    "parcelStatesIds",
    "totalCost",
    "status"
  ];
}

export default BuyTransaction;
