import {
  Project,
  AddressState,
  Bid,
  BidGroup,
  Job,
  ParcelState,
  LockedBalanceEvent,
  DistrictEntry
} from '../models'

import AddressService from './AddressService'

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
      },
    }
  }

  async getGlobalSummary(address) {
    const mostExpensiveBids = await ParcelState.findExpensive(5)

    return {
      totalMana: await LockedBalanceEvent.getTotalLockedMana(),
      totalLand: await DistrictEntry.getTotalLand(),
      manaSpentOnBids: await ParcelState.getTotalAmount(),

      mostExpensiveBid: mostExpensiveBids.length && mostExpensiveBids[0].amount,
      averageWinningBidCenter: await ParcelState.averageWinningBidBetween(
        [-22, -16],
        [22, 16]
      ),
      averageWinningBid: await ParcelState.averageWinningBid(),

      mostExpensiveBids,
      mostPopularParcels: await Bid.findPopular(5),
      biggestDistricts: await Project.findBiggest(5),

      largestBidders: await ParcelState.findLargestBidders(10),
      pendingParcels: await ParcelState.countOpen(),
      expectedEnd: await ParcelState.expectedEnd()
    }
  }

  async getAddressSummary(address) {
    address = address.toLowerCase()
    const lockEvents = await LockedBalanceEvent.findByAddress(address)
    const lockedMana = await new AddressService().lockedMANABalanceOf(address)
    const submissions = await DistrictEntry.getSummarySubmissions(address)
    const winningBids = await ParcelState.findByAddress(address)
    const addressState = await AddressState.findByAddressWithBidGroups(address)
    return {
      lockedMana,
      lockEvents,
      districtContributions: submissions,
      winningBids: winningBids,
      addressState
    }
  }
}

export default StatsService
