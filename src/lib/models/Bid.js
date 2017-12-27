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
      .query(`SELECT COUNT(*) FROM ${this.tableName}`)
      .then(r => r[0].count)
  }

  static findPopular(limit) {
    return this.db.query(
      `SELECT x::text || ',' || y::text AS "parcelId", COUNT(*)
        FROM ${this.tableName}
        GROUP BY x::text || ',' || y::text
        ORDER BY count DESC LIMIT $1`,
      [limit]
    )
  }

  static findSubmitters(limit) {
    return this.db.query(
      `SELECT address, COUNT(*)
        FROM ${this.tableName}
        GROUP BY address
        ORDER BY count DESC LIMIT $1`,
      [limit]
    )
  }
}

export default Bid
