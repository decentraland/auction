import { Model } from "decentraland-commons";

class DistrictEntry extends Model {
  static tableName = "district_entries";
  static columnNames = [
    "id",
    "address",
    "project_id",
    "lands",
    "userTimestamp"
  ];

  static getSubmissions(address) {
    return this.db.query(`
      SELECT * FROM district_entries WHERE address = $1
    `, [address]);
  }
}

export default DistrictEntry;
