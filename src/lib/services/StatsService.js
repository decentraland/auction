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
      }
    }
  }

  async getGlobalSummary(address) {
    const [
      totalMana,
      parcelSummary,
      manaSpentOnBids,

      mostExpensiveBids,
      averageWinningBidCenter,
      averageWinningBid,

      mostPopularParcels,
      biggestDistricts,

      largestBidders,
      pendingParcels,
      expectedEnd,
      recentlyUpdatedParcels
    ] = await Promise.all([
      LockedBalanceEvent.getTotalLockedMana(),
      ParcelState.summary(),
      ParcelState.getTotalAmount(),

      ParcelState.findExpensive(6),
      ParcelState.averageWinningBidBetween([-22, -16], [22, 16]),
      ParcelState.averageWinningBid(),

      Bid.findPopular(6),
      Project.findBiggest(6),

      ParcelState.findLargestBidders(10),
      ParcelState.countOpen(),
      ParcelState.expectedEnd(),
      ParcelState.recentlyUpdated()
    ])

    return {
      totalMana,
      totalLand: parcelSummary.count,
      manaSpentOnBids,

      mostExpensiveBid: mostExpensiveBids.length && mostExpensiveBids[0].amount,
      averageWinningBidCenter,
      averageWinningBid,

      mostExpensiveBids,
      mostPopularParcels,
      biggestDistricts,

      largestBidders,
      pendingParcels,
      expectedEnd: expectedEnd,
      recentlyUpdatedParcels
    }
  }

  async getAddressSummary(address) {
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

  async getParcelSummary(x, y) {
    return await this.getGlobalSummary()
  }
}

export default StatsService
