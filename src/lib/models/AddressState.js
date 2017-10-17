import { Model, utils } from "decentraland-commons";
import BidGroup from "./BidGroup";
import db from "../db";

class AddressState extends Model {
  static async findByAddress(address) {
    const rows = await db.query(
      `SELECT "address_states".*, row_to_json(bid_groups.*) as "bidGroup" FROM address_states
        LEFT JOIN bid_groups ON address_states."lastBidGroupId" = bid_groups."id"
        WHERE address_states."address" = $1
        LIMIT 1`,
      [address]
    );

    if (rows.length > 0) {
      const { bidGroup, ...addressState } = rows[0];

      if (bidGroup) {
        addressState.bidGroup = BidGroup.deserialize(bidGroup, "bytea");
      }

      return addressState;
    }
  }

  static async findByAddressWithBids(address) {
    const rows = await db.query(
      `SELECT "address_states".*, row_to_json(bid_groups.*) as "bidGroup" FROM address_states
        LEFT JOIN bid_groups ON bid_groups."address" = $1
        WHERE address_states."address" = $1`,
      [address]
    );

    if (rows.length > 0) {
      const addressState = rows[0];

      addressState.bidGroups = rows
        .filter(row => !!row.bidGroup)
        .map(row => BidGroup.deserialize(row.bidGroup, "bytea"));

      delete addressState.bidGroup;

      return addressState;
    }
  }

  static async insert(addressState) {
    return await db.insert(
      "address_states",
      utils.pick(addressState, ["address", "balance", "lastBidGroupId"])
    );
  }
}

export default AddressState;
