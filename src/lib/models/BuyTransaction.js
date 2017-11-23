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
    const query =
      // eslint-disable-next-line
      "SELECT UNNEST(\"parcelStatesIds\") AS id FROM buy_transactions WHERE status IN ('completed', 'pending') AND address = $1"
    return this.db.query(query, [address]).then(rows => rows.map(row => row.id))
  }

  static totalBurnedMANAByAddress(address) {
    const query =
      // eslint-disable-next-line
      "SELECT \"totalCost\" FROM buy_transactions WHERE status IN ('completed', 'pending') AND address = $1"
    return this.db
      .query(query, [address])
      .then(rows =>
        rows
          .map(row => eth.utils.toBigNumber(row.totalCost))
          .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))
      )
  }
}

export default BuyTransaction
