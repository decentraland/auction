import { Model } from "decentraland-commons";

class OutbidNotification extends Model {
  static tableName = "outbid_notifications";
  static columnNames = ["parcelStateId", "email", "active"];

  static async findActiveByParcelId(parcelId) {
    return await this.findOne({
      parcelId,
      active: true
    });
  }

  static async deactivate(id) {
    return await this.update({ active: false }, { id });
  }
}

export default OutbidNotification;
