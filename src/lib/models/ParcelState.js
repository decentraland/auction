import { Model, utils } from "decentraland-commons";
import BidGroup from "./BidGroup";
import db from "../db";

class ParcelState extends Model {
  static hashId(x, y) {
    if (!x || !y) {
      throw new Error(
        `You need to supply both coordinates to be able to hash them. x = ${x} y = ${y}`
      );
    }

    return `${x}||${y}`;
  }

  static async findByIdWithBids(id) {
    const rows = await db.query(
      `SELECT "parcel_states".*, row_to_json(bid_groups.*) as "bidGroup" FROM parcel_states
        LEFT JOIN bid_groups ON parcel_states."address" = bid_groups."address"
        WHERE parcel_states."id" = $1`,
      [id]
    );

    if (rows.length > 0) {
      const parcelState = rows[0];

      parcelState.bidGroups = rows
        .filter(row => !!row.bidGroup)
        .map(row => BidGroup.deserialize(row.bidGroup, "bytea"));

      delete parcelState.bidGroup;

      return parcelState;
    }
  }

  static async insert(parcelState) {
    const { x, y } = parcelState;

    parcelState.id = ParcelState.hashId(x, y);

    return await db.insert(
      "parcel_states",
      utils.pick(parcelState, [
        "id",
        "x",
        "y",
        "amount",
        "address",
        "endsAt",
        "bidGroupId",
        "bidIndex"
      ])
    );
  }
}

export default ParcelState;
