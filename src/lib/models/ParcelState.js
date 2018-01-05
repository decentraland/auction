import { Model } from 'decentraland-commons'
import BidGroup from './BidGroup'
import coordinates from '../coordinates'

class ParcelState extends Model {
  static tableName = 'parcel_states'
  static columnNames = [
    'id',
    'x',
    'y',
    'amount',
    'address',
    'endsAt',
    'bidGroupId',
    'bidIndex',
    'projectId'
  ]

  static hashId(x, y) {
    if (!coordinates.isValid([x, y])) {
      throw new Error(
        `You need to supply both coordinates to be able to hash them. x = ${x} y = ${y}`
      )
    }

    return `${x},${y}`
  }

  static async getTotalAmount() {
    const result = await this.db.query(
      `SELECT SUM(amount::int) as total FROM ${this.tableName}`
    )
    return result.length ? result[0].total : 0
  }

  static async findFullById(id) {
    const rows = await this.db.query(
      `SELECT parcel_states.*, row_to_json(bids.*) as "bid", row_to_json(projects.*) as "project"
        FROM ${this.tableName}
        LEFT JOIN bids ON parcel_states."x" = bids."x" AND parcel_states."y" = bids."y"
        LEFT JOIN projects ON parcel_states."projectId" = projects."id"
        WHERE parcel_states."id" = $1
        ORDER BY bids.amount::int DESC`,
      [id]
    )

    if (rows.length > 0) {
      const result = rows[0]

      if (result.bid) {
        result.bids = rows.map(row => row.bid)
        delete result.bid
      }

      return result
    }
  }

  static async findByIdWithBidGroups(id) {
    const rows = await this.db.query(
      `SELECT "parcel_states".*, row_to_json(bid_groups.*) as "bidGroup" FROM parcel_states
        LEFT JOIN bid_groups ON parcel_states."address" = bid_groups."address"
        WHERE parcel_states."id" = $1`,
      [id]
    )

    if (rows.length > 0) {
      const parcelState = rows[0]

      parcelState.bidGroups = BidGroup.deserializeJoinedRows(rows)
      delete parcelState.bidGroup

      return parcelState
    }
  }

  static async findInCoordinates(coords) {
    let where = coords.map(coord => {
      const [x, y] = coordinates.toArray(coord)
      return `(x = ${x} AND y = ${y})`
    })

    where = where.join(' OR ')

    return await this.db.query(
      `SELECT "parcel_states".* FROM ${this.tableName} WHERE ${where}`
    )
  }

  static findAllAddresses() {
    return this.db.query(`SELECT DISTINCT(address) FROM ${this.tableName}`)
  }

  static findByAddress(address) {
    return this.db.query(`SELECT * FROM ${this.tableName} WHERE address = $1`, [
      address
    ])
  }

  static findByUpdatedSince(ids, since) {
    return this.db.query(
      `SELECT id, x, y, address, amount
        FROM ${this.tableName}
        WHERE id = ANY ($1) AND "updatedAt" > $2`,
      [ids, since]
    )
  }

  static async inRange(min, max) {
    const [minx, miny] = coordinates.toArray(min)
    const [maxx, maxy] = coordinates.toArray(max)

    return await this.db.query(
      `SELECT * FROM ${this.tableName}
        WHERE x >= $1 AND y >= $2
          AND x <= $3 AND y <= $4`,
      [minx, miny, maxx, maxy]
    )
  }

  static findLargestBidders(limit = 10) {
    return this.db.query(
      `SELECT address, sum(amount::int) as sum, count(amount) as count
        FROM ${this.tableName}
        WHERE address IS NOT NULL
        GROUP BY address
        ORDER BY sum DESC LIMIT $1`,
      [limit]
    )
  }

  static async averageWinningBid() {
    const result = await this.db.query(
      `SELECT AVG(amount::int) as avg
        FROM ${this.tableName}
        WHERE address IS NOT NULL`
    )

    return result.length ? result[0].avg : 0
  }

  static async averageWinningBidBetween(min, max) {
    const [minx, miny] = coordinates.toArray(min)
    const [maxx, maxy] = coordinates.toArray(max)

    const result = await this.db.query(
      `SELECT AVG(amount::int) as avg
        FROM ${this.tableName}
        WHERE x >= $1 AND y >= $2
          AND x <= $3 AND y <= $4
          AND address IS NOT NULL`,
      [minx, miny, maxx, maxy]
    )

    return result.length ? result[0].avg : 0
  }

  static async countOpen() {
    const result = await this.db.query(
      `SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE ${this.tableName}."endsAt" > NOW()`
    )
    return result.length ? result[0].count : 0
  }

  static async expectedEnd() {
    const result = await this.db.query(
      `SELECT MAX(${this.tableName}."endsAt") as end
        FROM ${this.tableName}`
    )
    if (!result.length) return 0
    const date = result[0].end
    return date.getTime() - date.getTimezoneOffset() * 60 * 1000
  }

  static async recentlyUpdated(limit = 5) {
    return (await this.db.query(
      `SELECT  "${this.tableName}".*
        FROM ${this.tableName}
        ORDER BY "${this.tableName}"."updatedAt" DESC
        LIMIT $1`,
      [limit]
    )).map(e => {
      e.updatedAt.setTime(
        e.updatedAt.getTime() - e.updatedAt.getTimezoneOffset() * 60 * 1000
      )
      return e
    })
  }

  static async insert(parcelState) {
    const { x, y } = parcelState
    parcelState.id = ParcelState.hashId(x, y)

    return await super.insert(parcelState)
  }

  static summary() {
    return this.db
      .query(
        `SELECT COUNT(*), MAX(amount::int), SUM(amount::int)
          FROM ${this.tableName}
          WHERE address IS NOT NULL`
      )
      .then(r => r[0])
  }

  static findExpensive(limit) {
    return this.db.query(
      `SELECT id, amount::int
        FROM ${this.tableName}
        WHERE address IS NOT NULL
        ORDER BY amount::int DESC LIMIT $1`,
      [limit]
    )
  }

  static findLandlords(limit) {
    return this.db.query(
      `SELECT address, COUNT(*)
        FROM ${this.tableName}
        WHERE address IS NOT NULL
        GROUP BY address
        ORDER BY count DESC LIMIT $1`,
      [limit]
    )
  }

  static countOwners() {
    return this.db
      .query(`SELECT COUNT(DISTINCT(address)) FROM ${this.tableName}`)
      .then(r => r[0].count)
  }

  isReserved() {
    return !!this.get('projectId')
  }
}

export default ParcelState
