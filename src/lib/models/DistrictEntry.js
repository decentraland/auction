import { Model } from 'decentraland-commons'

class DistrictEntry extends Model {
  static tableName = 'district_entries'
  static columnNames = [
    'id',
    'address',
    'project_id',
    'lands',
    'userTimestamp',
    'action'
  ]

  static countSubmissions() {
    return this.db.query('SELECT count(*) as amount FROM district_entries')
  }

  static getSubmissions(address) {
    return this.db.query(
      `
      SELECT * FROM district_entries WHERE address = $1
    `,
      [address]
    )
  }

  static getMonthlyLockedBalanceByAddress(address, landCost) {
    return this.db.query(
      'SELECT EXTRACT(month from TO_TIMESTAMP("userTimestamp"::bigint / 1000)) AS month, SUM(lands) * $1 AS mana FROM district_entries WHERE address = $2 GROUP BY month',
      [landCost, address.toLowerCase()]
    )
  }
}

export default DistrictEntry
