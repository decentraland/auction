import { eth, Model } from 'decentraland-commons'

class BuyTransaction extends Model {
  static tableName = 'buy_transactions'
  static columnNames = [
    'id',
    'txId',
    'address',
    'parcelStatesIds',
    'totalCost',
    'status',
    'receipt'
  ]

  static findAllPendingTxIds() {
    return this.find({ status: 'pending' }).then(rows =>
      rows.map(row => row.txId)
    )
  }

  static findProcessedParcels(address) {
    return this.db
      .query(
        "SELECT UNNEST(\"parcelStatesIds\") AS id FROM buy_transactions WHERE status IN ('completed', 'pending') AND address = $1",
        [address]
      )
      .then(rows => rows.map(row => row.id))
  }

  static totalBurnedMANAByAddress(address) {
    return this.db
      .query(
        'SELECT "totalCost" FROM buy_transactions WHERE status IN (\'completed\', \'pending\') AND address = $1',
        [address]
      )
      .then(rows =>
        rows
          .map(row => eth.utils.toBigNumber(row.totalCost))
          .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))
      )
  }
}

export default BuyTransaction
