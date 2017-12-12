import tinycolor2 from 'tinycolor2'

import { ONE_LAND_IN_MANA } from './land'
import { buildCoordinate, capitalize } from './util'
import * as addressStateUtils from './addressStateUtils'

export const COLORS = {
  won: '#558FDE',
  winning: '#96B8E7',
  lost: '#49255D',
  outbid: '#DF423E',
  taken: '#3C516A',
  genesis: '#FFFFFF',
  roads: '#5C5C5C',
  district: '#AA8CDD',
  littleValue: '#FEF191',
  bigValue: '#FF0000',
  default: '#EAEAEA',
  pending: '#02B45D',
  loading: '#AAAAAA'
}

const genesis = '55327350-d9f0-4cae-b0f3-8745a0431099'
const roads = 'f77140f9-c7b4-4787-89c9-9fa0e219b079'
const minHSV = tinycolor2(COLORS.littleValue).toHsv()
const maxHSV = tinycolor2(COLORS.bigValue).toHsv()

export const CLASS_NAMES = {
  won: 'won',
  winning: 'winning',
  lost: 'lost',
  outbid: 'outbid',
  taken: 'taken',
  genesis: 'genesis',
  district: 'district',
  roads: 'roads',
  default: 'default',
  pending: 'pending',
  loading: 'loading'
}

export function isPending(parcel, pendingConfirmationBids) {
  return (
    pendingConfirmationBids &&
    pendingConfirmationBids.filter(
      bid => bid.x === parcel.x && bid.y === parcel.y
    ).length > 0
  )
}

export function getClassName(parcel, addressState, pendingConfirmationBids) {
  if (!parcel || parcel.error) return CLASS_NAMES.loading
  if (reservation(parcel)) return reservation(parcel)
  if (isPending(parcel, pendingConfirmationBids)) return CLASS_NAMES.pending
  if (!parcel.amount) return CLASS_NAMES.default

  let className = ''

  if (addressStateUtils.hasBidInParcel(addressState, parcel)) {
    const byAddress = parcel.address === addressState.address

    if (hasEnded(parcel)) {
      className = byAddress ? CLASS_NAMES.won : CLASS_NAMES.lost
    } else {
      className = byAddress ? CLASS_NAMES.winning : CLASS_NAMES.outbid
    }
  } else if (hasEnded(parcel)) {
    className = CLASS_NAMES.taken
  }

  return className
}

export function getBidStatus(parcel, addressState) {
  const className = getClassName(parcel, addressState)
  let status = ''

  switch (className) {
    case CLASS_NAMES.default:
    case CLASS_NAMES.loading:
      status = ''
      break
    case CLASS_NAMES.genesis:
      status = 'Plaza'
      break
    case CLASS_NAMES.roads:
      status = 'Road'
      break
    default:
      status = capitalize(className)
  }

  return status
}

export function getColorByAmount(amount, maxAmount) {
  // toHsv() => { h: 0, s: 1, v: 1, a: 1 }
  const h = memorizedHue(amount, maxAmount)
  const s = memorizedSat(amount, maxAmount)

  return tinycolor2({ h, s, v: 1, a: 1 }).toHexString()
}

export function reservation(parcel) {
  return (
    !!parcel.projectId &&
    (parcel.projectId === genesis
      ? CLASS_NAMES.genesis
      : parcel.projectId === roads ? CLASS_NAMES.roads : CLASS_NAMES.district)
  )
}

export function hasEnded(parcel) {
  return parcel.endsAt && Date.now() >= parcel.endsAt.getTime()
}

var savedMaxAmount = null
var savedHues = {}
var savedSats = {}

function memorizedHue(amount, maxAmount) {
  if (maxAmount === savedMaxAmount) {
    if (!savedHues[amount]) {
      savedHues[amount] = calculateColorValue(
        amount,
        maxAmount,
        minHSV.h,
        maxHSV.h
      )
    }
    return savedHues[amount]
  } else {
    savedMaxAmount = maxAmount
    savedHues = {}
    savedSats = {}
    return memorizedHue(amount, maxAmount)
  }
}

function memorizedSat(amount, maxAmount) {
  if (maxAmount === savedMaxAmount) {
    if (!savedSats[amount]) {
      savedSats[amount] = calculateColorValue(
        amount,
        maxAmount,
        minHSV.s,
        maxHSV.s
      )
    }
    return savedSats[amount]
  } else {
    savedMaxAmount = maxAmount
    savedHues = {}
    savedSats = {}
    return memorizedSat(amount, maxAmount)
  }
}

function calculateColorValue(amount, maxAmount, minValue, maxValue) {
  const priceRate = amount - ONE_LAND_IN_MANA
  return priceRate * (maxValue - minValue) / maxAmount + minValue
}

export function generateMatrix(minX, minY, maxX, maxY) {
  const matrix = []
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      matrix.push(buildCoordinate(x, y))
    }
  }
  return matrix
}

export function projectForParcel(parcel, projects) {
  for (const project of projects.data) {
    if (project.id === parcel.projectId && project.name !== 'Roads') {
      return project
    }
  }
}

export function getBounds() {
  return {
    minX: -150,
    minY: -150,
    maxX: 150,
    maxY: 150
  }
}

export const MINIMUM_BID_INCREMENT = 1.1

export function minimumBid(previousBid) {
  if (!previousBid) {
    return ONE_LAND_IN_MANA
  }
  return Math.ceil(previousBid * MINIMUM_BID_INCREMENT)
}
