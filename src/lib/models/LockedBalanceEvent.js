import { Model } from "decentraland-commons";

class LockedBalanceEvent extends Model {
  static tableName = "locked_balance_events";
  static columnNames = ["id", "address", "txId", "mana", "confirmedAt"];

  static countEvents() {
    return this.db.query(
      `SELECT COUNT(*) AS amount FROM locked_balance_events`
    );
  }

  static getMonthlyLockedBalanceByAddress(address) {
    return this.db.query(
      `
      SELECT EXTRACT(month from "confirmedAt") AS month, SUM(mana) AS mana
         FROM locked_balance_events
         WHERE address = $1
     GROUP BY month
    `,
      [address]
    );
  }

  static getLockedAddresses() {
    return this.db
      .query(`SELECT DISTINCT(address) FROM locked_balance_events`)
      .then(rows => rows.map(row => row.address));
  }
}

export default LockedBalanceEvent;
