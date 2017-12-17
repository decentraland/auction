import { Model } from 'decentraland-commons'

class Bid extends Model {
  static tableName = 'bids'
  static columnNames = [
    'x',
    'y',
    'bidGroupId',
    'bidIndex',
    'address',
    'receivedAt',
    'amount'
  ]

  static findByAddress(address) {
    return this.find({ address })
  }

  static findInBidGroup(bidGroupId, bidIndex) {
    return this.findOne({ bidGroupId, bidIndex })
  }

  static count() {
    return this.db
      .query(`SELECT COUNT(*) FROM ${Bid.tableName}`)
      .then(r => r[0].count)
  }

  static popular(limit) {
    return this.db.query(
      `SELECT x::text || ',' || y::text AS parcelId, COUNT(*) FROM ${Bid.tableName} GROUP BY x::text || ',' || y::text ORDER BY count DESC LIMIT ${limit}`
    )
  }

  static submitters(limit) {
    return this.db.query(
      `SELECT address, COUNT(*) FROM ${Bid.tableName} GROUP BY address ORDER BY count DESC LIMIT ${limit}`
    )
  }
}

export default Bid
