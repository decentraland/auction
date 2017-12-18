import { AddressState, Bid, BidGroup, Job, ParcelState } from '../models'

class StatsService {
  constructor() {
    this.AddressState = AddressState
    this.Bid = Bid
    this.BidGroup = BidGroup
    this.Job = Job
    this.ParcelState = ParcelState
  }

  async summary() {
    const addressSummary = await this.AddressState.summary()
    const parcelSummary = await this.ParcelState.summary()

    return {
      addresses: {
        count: addressSummary.count,
        balance: addressSummary.sum,
        max: addressSummary.max,
        email: await this.AddressState.countWithEmail()
      },
      bids: {
        count: await this.Bid.count(),
        submissions: await this.BidGroup.count(),
        submitters: await this.Bid.findSubmitters(10)
      },
      parcels: {
        count: parcelSummary.count,
        total: parcelSummary.sum,
        max: parcelSummary.max,
        owners: await this.ParcelState.countOwners(),
        popular: await this.Bid.findPopular(10),
        expensive: await this.ParcelState.findExpensive(10),
        landlords: await this.ParcelState.findLandlords(10)
      },
      notifications: {
        sent: await this.Job.count()
      }
    }
  }

  async getAddressSummary(address) {

    return {
      lockedMana: '',
      bonusPerMonth: {
        9: 123,
        10: 134,
        11: 145,
        12: 156
      },
      districtContributions: [],
      winningBids: [],
      balance: '1000'
    }
  }
}

export default StatsService
