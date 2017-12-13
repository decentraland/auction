import { DistrictEntry, LockedBalanceEvent } from '../models'

const LAND_MANA_COST = 1000

const BEFORE_NOVEMBER_DISCOUNT = 1.15
const DURING_NOVEMBER_DISCOUNT = 1.1
const AFTER_NOVEMBER_DISCOUNT = 1.0

export default class AddressService {
  constructor() {
    this.DistrictEntry = DistrictEntry
    this.LockedBalanceEvent = LockedBalanceEvent
  }

  static LAND_MANA_COST = LAND_MANA_COST

  static BEFORE_NOVEMBER_DISCOUNT = BEFORE_NOVEMBER_DISCOUNT
  static DURING_NOVEMBER_DISCOUNT = DURING_NOVEMBER_DISCOUNT
  static AFTER_NOVEMBER_DISCOUNT = AFTER_NOVEMBER_DISCOUNT

  async lockedMANABalanceOf(address) {
    // get MANA locked to districts
    const monthlyLandBalances = await this.DistrictEntry.getMonthlyLockedBalanceByAddress(
      address,
      LAND_MANA_COST
    ).then(balances => fillByMonth(balances))

    // get total MANA locked to terraform
    const monthlyLockedBalances = await this.LockedBalanceEvent.getMonthlyLockedBalanceByAddress(
      address
    ).then(balances => fillByMonth(balances))

    // adjust MANA balances to bonuses
    const beforeNovBalanceToAuction = calculateTotalForMonths(
      monthlyLandBalances,
      monthlyLockedBalances,
      [9, 10]
    )
    const duringNovBalanceToAuction = calculateTotalForMonths(
      monthlyLandBalances,
      monthlyLockedBalances,
      [11]
    )
    const afterNovBalanceToAuction = calculateTotalForMonths(
      monthlyLandBalances,
      monthlyLockedBalances,
      [12, 1, 2]
    )

    // total MANA locked in districts
    const totalLockedToDistricts = Object.values(monthlyLandBalances).reduce(
      (total, value) => total + value,
      0
    )

    // total MANA locked
    return {
      monthlyLockedBalances,
      monthlyLandBalances,
      totalLockedMANA:
        Math.floor(beforeNovBalanceToAuction * BEFORE_NOVEMBER_DISCOUNT) +
        Math.floor(duringNovBalanceToAuction * DURING_NOVEMBER_DISCOUNT) +
        Math.floor(afterNovBalanceToAuction * AFTER_NOVEMBER_DISCOUNT) +
        totalLockedToDistricts
    }
  }

  static fillByMonth(...args) {
    return fillByMonth(...args)
  }

  static calculateTotalForMonths(...args) {
    return calculateTotalForMonths(...args)
  }
}

function fillByMonth(items) {
  const months = new Array(12).fill(0)
  const groups = months.reduce(
    (obj, _, index) => Object.assign(obj, { [index + 1]: 0 }),
    {}
  )

  for (let { month, mana } of items) {
    groups[month] = parseInt(mana, 10)
  }
  return groups
}

function calculateTotalForMonths(
  monthlyLockedBalancesToDistricts,
  monthlyLockedBalancesTotal,
  months
) {
  return months.reduce((total, index) => {
    return (
      total +
      monthlyLockedBalancesTotal[index] -
      monthlyLockedBalancesToDistricts[index]
    )
  }, 0)
}
