import db from "../db";

/**
 * Address state model. Interfaces with the database
 */
class AddressState {
  static async findByAddress(address) {
    return await db.selectOne("address_states", {
      address
    });
  }

  static async insert({ address, balance, lastBidGroupId }) {
    return await db.insert("address_states", {
      address,
      balance,
      lastBidGroupId
    });
  }
}

export default AddressState;
