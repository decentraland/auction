import { Model } from 'decentraland-commons'

class Job extends Model {
  static tableName = 'jobs'
  static columnNames = ['type', 'referenceId', 'state', 'data']

  static serialize(attributes, encoding) {
    let { data } = attributes
    if (typeof data !== 'string') data = JSON.stringify(data)

    return Object.assign({}, attributes, { data })
  }

  static deserialize(attributes, encoding) {
    let { data } = attributes
    if (typeof data === 'string') data = JSON.parse(data)

    return Object.assign({}, attributes, { data })
  }

  static findLastByReferenceId(referenceId) {
    return this.findOne({referenceId}, {id: 'DESC'})
  }

  static async insert(job) {
    let inserted = await super.insert(this.serialize(job))
    return this.deserialize(inserted)
  }

  static async perform(jobDescription, doWork) {
    let job = await this.insert({
      ...jobDescription,
      state: 'pending'
    })

    try {
      await doWork()
      await this.update({ state: 'complete' }, { id: job.id })
    } catch (error) {
      job.data = Object.assign({ error: error.message }, job.data)
      await this.update({ state: 'error', data: job.data }, { id: job.id })

      throw error
    }
  }
}

export default Job
