import { Model } from 'decentraland-commons'

class Bid extends Model {
  static tableName = 'bids'
  static columnNames = [
    'x',
    'y',
    'bidGroupId',
    'bidIndex',
    'address',
    'receivedAt',
    'amount'
  ]

  static findByAddress(address) {
    return this.find({ address })
  }

  static findInBidGroup(bidGroupId, bidIndex) {
    return this.findOne({ bidGroupId, bidIndex })
  }
}

export default Bid
