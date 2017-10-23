import { Model } from "decentraland-commons";

class OutbidNotification extends Model {
  static tableName = "outbid_notifications";
  static columnNames = ["parcelStateId", "email", "active"];

  static async findActiveByParcelStateId(parcelStateId) {
    return await this.find({
      parcelStateId,
      active: true
    });
  }

  static async deactivate(id) {
    return await this.update({ active: false }, { id });
  }
}

export default OutbidNotification;
