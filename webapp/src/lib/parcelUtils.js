import tinycolor2 from 'tinycolor2'

import { ONE_LAND_IN_MANA } from './land'
import { buildCoordinate, capitalize } from './util'
import * as addressStateUtils from './addressStateUtils'

export const COLORS = {
  won: '#4A90E2',
  winning: '#97b9e5',
  lost: '#3C225F',
  outbid: '#EF303B',
  taken: '#4F3A4B',
  reserved: '#FFF',
  littleValue: '#FFF189',
  bigValue: '#EF303B',
  default: '#EAEAEA',
  pending: '#02B45D',
  loading: '#AAAAAA'
}

export const CLASS_NAMES = {
  won: 'won',
  winning: 'winning',
  lost: 'lost',
  outbid: 'outbid',
  taken: 'taken',
  reserved: 'reserved',
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
  if (isReserved(parcel)) return CLASS_NAMES.reserved
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
    default:
      status = capitalize(className)
  }

  return status
}

export function getColorByAmount(amount) {
  // toHsv() => { h: 0, s: 1, v: 1, a: 1 }
  const minHSV = tinycolor2(COLORS.littleValue).toHsv()
  const maxHSV = tinycolor2(COLORS.bigValue).toHsv()

  const h = calculateColorValue(amount, minHSV.h, maxHSV.h)
  const s = calculateColorValue(amount, minHSV.s, maxHSV.s)

  return tinycolor2({ h, s, v: 1, a: 1 }).toHexString()
}

export function isReserved(parcel) {
  return !!parcel.projectId
}

export function hasEnded(parcel) {
  return parcel.endsAt && Date.now() >= parcel.endsAt.getTime()
}

function calculateColorValue(amount, minValue, maxValue) {
  const priceRate = amount - ONE_LAND_IN_MANA
  return (maxValue - minValue) * amount / (priceRate + minValue)
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
    if (project.id === parcel.projectId) {
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
