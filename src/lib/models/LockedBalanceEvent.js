import { Model } from 'decentraland-commons'

class LockedBalanceEvent extends Model {
  static tableName = 'locked_balance_events'
  static columnNames = ['id', 'address', 'txId', 'mana', 'confirmedAt']

  static countEvents() {
    return this.db.query(`SELECT COUNT(*) AS amount FROM ${this.tableName}`)
  }

  static async getTotalLockedMana() {
    const result = await this.db.query(
      `SELECT SUM(mana) as total FROM ${this.tableName}`
    )
    return result.length ? result[0].total : 0
  }

  static getMonthlyLockedBalanceByAddress(address) {
    return this.db.query(
      `SELECT EXTRACT(month from "confirmedAt") AS month, SUM(mana) AS mana
         FROM ${this.tableName}
         WHERE address = $1
         GROUP BY month`,
      [address.toLowerCase()]
    )
  }

  static getLockedAddresses() {
    return this.db
      .query(`SELECT DISTINCT(address) FROM ${this.tableName}`)
      .then(rows => rows.map(row => row.address))
  }

  static findByAddress(address) {
    return this.find({ address })
  }
}

export default LockedBalanceEvent
