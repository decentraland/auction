import { Model, utils } from "decentraland-commons";
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
    throw new Error("Not implemented");
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
