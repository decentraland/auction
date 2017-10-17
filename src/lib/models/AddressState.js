import { Model } from "decentraland-commons";
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

  static async insert(addressState) {
    const { address, balance, lastBidGroupId } = addressState

    return await db.insert("address_states", {
      address,
      balance,
      lastBidGroupId
    });
  }
}

export default AddressState;
