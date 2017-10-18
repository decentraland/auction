import { Model } from "decentraland-commons";

class Project extends Model {
  static tableName = "projects";
  static columnNames = [
    "name",
    "desc",
    "link",
    "public",
    "parcels",
    "priority",
    "disabled"
  ];

  static findByName(name) {
    return this.db.selectOne(this.tableName, { name });
  }
}

export default Project;
