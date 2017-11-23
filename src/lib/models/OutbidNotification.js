import { Model } from 'decentraland-commons'

class OutbidNotification extends Model {
  static tableName = 'outbid_notifications'
  static columnNames = ['parcelStateId', 'email', 'active', 'updatedAt']

  static findSubscribedEmails() {
    return this.db
      .query(
        'SELECT DISTINCT(email) FROM outbid_notifications WHERE active=true'
      )
      .then(rows => rows.map(row => row.email))
  }

  static findActiveByEmail(email) {
    return this.find({
      email,
      active: true
    })
  }

  static findActiveByParcelStateId(parcelStateId) {
    return this.find({
      parcelStateId,
      active: true
    })
  }

  static deactivate(id) {
    return this.update({ active: false }, { id })
  }
}

export default OutbidNotification
