import { Model } from 'decentraland-commons'
import uuid from 'uuid'

class Project extends Model {
  static tableName = 'projects'
  static columnNames = [
    'id',
    'name',
    'desc',
    'link',
    'public',
    'parcels',
    'priority',
    'disabled',
    'lookup'
  ]

  static count(name) {
    return this.db.query('SELECT count(*) as amount FROM projects')
  }

  static findBiggest(limit = 10) {
    return this.db.query(
      `SELECT *
        FROM ${this.tableName}
        ORDER BY parcels DESC LIMIT $1`,
      [limit]
    )
  }

  static findByName(name) {
    return this.findOne({ name })
  }

  static insert(project) {
    project.id = project.id || uuid.v4()
    return super.insert(project)
  }
}

export default Project
