import { Model } from "decentraland-commons";
import uuid from "uuid";

class Project extends Model {
  static tableName = "projects";
  static columnNames = [
    "id",
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

  static insert(project) {
    project.id = uuid.v4();
    return super.insert(project);
  }
}

export default Project;
