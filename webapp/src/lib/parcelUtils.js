import tinycolor2 from 'tinycolor2'

import { ONE_LAND_IN_MANA } from './land'
import { buildCoordinate } from './util'
import * as addressStateUtils from './addressStateUtils'

export function getBidStatus(parcel, ownerAddress, debug) {
  if (!parcel) return ''
  if (isReserved(parcel)) return 'Reserved'
  if (!parcel.amount) return ''

  const byAddress = parcel.address === ownerAddress
  let status = ''

  if (hasEnded(parcel)) {
    status = byAddress ? 'Won' : 'Lost'
  } else {
    status = byAddress ? 'Winning' : 'Outbid'
  }

  return status
}

export const COLORS = {
  Won: '#4A90E2',
  Winning: '#30D7A9',
  Lost: '#3C225F',
  Outbid: '#EF303B',
  Taken: '#4F3A4B',
  Reserved: '#FFF',
  LittleValue: '#FFF189',
  BigValue: '#EF303B',
  Default: '#EAEAEA',
  Loading: '#AAAAAA'
}

export const CLASS_NAMES = {
  Won: 'won',
  Winning: 'winning',
  Lost: 'lost',
  Outbid: 'outbid',
  Taken: 'taken',
  Reserved: 'reserved',
  Default: 'default',
  Loading: 'loading'
}

export function getClassName(parcel, addressState) {
  if (!parcel || parcel.error) return CLASS_NAMES.Loading
  if (isReserved(parcel)) return CLASS_NAMES.Reserved
  if (!parcel.amount) return CLASS_NAMES.Default

  let className = ''

  if (addressStateUtils.hasBidInParcel(addressState, parcel)) {
    const status = getBidStatus(parcel, addressState.address)
    className = CLASS_NAMES[status] || CLASS_NAMES.Default
  } else if (hasEnded(parcel)) {
    className = CLASS_NAMES.Taken
  }

  return className
}

export function getColorByAmount(amount) {
  // toHsv() => { h: 0, s: 1, v: 1, a: 1 }
  const minHSV = tinycolor2(COLORS.LittleValue).toHsv()
  const maxHSV = tinycolor2(COLORS.BigValue).toHsv()

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
    minX: -160,
    minY: -160,
    maxX: 160,
    maxY: 160
  }
}

export const MINIMUM_BID_INCREMENT = 1.1

export function minimumBid(previousBid) {
  if (!previousBid) {
    return ONE_LAND_IN_MANA
  }
  return Math.ceil(previousBid * MINIMUM_BID_INCREMENT)
}
