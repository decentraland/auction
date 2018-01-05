import { Model } from 'decentraland-commons'

class ReturnTransaction extends Model {
  static tableName = 'return_transactions'
  static columnNames = ['id', 'txId', 'address', 'amount', 'status', 'receipt']

  static findAllPendingTxIds() {
    return this.db
      .query(
        `SELECT DISTINCT(txId) FROM ${BuyTransaction.tableName} WHERE status = 'pending'`
      )
      .then(rows => rows.map(row => row.txId))
  }

  static findByAddress(address) {
    return this.findOne({ address })
  }

  static findAllByAddress(address) {
    return this.find({ address })
  }
}

export default ReturnTransaction
