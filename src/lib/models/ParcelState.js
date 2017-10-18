import { Model } from "decentraland-commons";
import BidGroup from "./BidGroup";
import coordinates from "../coordinates";

class ParcelState extends Model {
  static tableName = "parcel_states";
  static columnNames = [
    "id",
    "x",
    "y",
    "amount",
    "address",
    "endsAt",
    "bidGroupId",
    "bidIndex"
  ];

  static hashId(x, y) {
    if (!coordinates.isValid([x, y])) {
      throw new Error(
        `You need to supply both coordinates to be able to hash them. x = ${x} y = ${y}`
      );
    }

    return `${x}||${y}`;
  }

  static async findByIdWithBidGroups(id) {
    const rows = await this.db.query(
      `SELECT "parcel_states".*, row_to_json(bid_groups.*) as "bidGroup" FROM parcel_states
        LEFT JOIN bid_groups ON parcel_states."address" = bid_groups."address"
        WHERE parcel_states."id" = $1`,
      [id]
    );

    if (rows.length > 0) {
      const parcelState = rows[0];

      parcelState.bidGroups = BidGroup.deserializeJoinedRows(rows);
      delete parcelState.bidGroup;

      return parcelState;
    }
  }

  static async findInCoordinates(coords) {
    let where = coords.map(coord => {
      const [x, y] = coordinates.toArray(coord);
      return `(x = ${x} AND y = ${y})`;
    });

    where = where.join(" OR ");

    return await this.db.query(
      `SELECT "parcel_states".* FROM parcel_states WHERE ${where}`
    );
  }

  static async inRange(min, max) {
    const [minx, miny] = coordinates.toArray(min);
    const [maxx, maxy] = coordinates.toArray(max);

    return await this.db.query(
      `SELECT "parcel_states".* FROM parcel_states
        WHERE parcel_states."x" >= $1 AND parcel_states."y" >= $2
          AND parcel_states."x" <= $3 AND parcel_states."y" <= $4`,
      [minx, miny, maxx, maxy]
    );
  }

  static async insert(parcelState) {
    const { x, y } = parcelState;
    parcelState.id = ParcelState.hashId(x, y);

    return await super.insert(parcelState);
  }
}

export default ParcelState;
