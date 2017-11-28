import tinycolor2 from 'tinycolor2'

import { ONE_LAND_IN_MANA } from './land'
import { buildCoordinate } from './util'
import * as addressStateUtils from './addressStateUtils'

export function getBidStatus(parcel, ownerAddress) {
  if (!parcel || !parcel.endsAt) return ''

  let status = ''

  const ended = hasEnded(parcel)
  const byAddress = parcel.address === ownerAddress

  if (ended) {
    status = byAddress ? 'Won' : 'Lost'
  } else {
    status = byAddress ? 'Winning' : 'Outbid'
  }
  return status
}

export const COLORS = {
  Won: '#30D7A9',
  Winning: '#30D7A9',
  Lost: '#AE4DE8',
  Outbid: '#AE4DE8',
  Taken: '#3E396B',
  LittleValue: '#EAFF28',
  BigValue: '#FF1111',
  Default: '#EAEAEA',
  Loading: '#D0D0D0'
}

export const CLASS_NAMES = {
  Won: 'won',
  Winning: 'winning',
  Lost: 'lost',
  Outbid: 'outbid',
  Taken: 'taken',
  Default: 'default',
  Loading: 'loading'
}

export function getClassName(parcel, addressState) {
  if (!parcel || parcel.error) return CLASS_NAMES.Loading
  if (isTaken(parcel)) return CLASS_NAMES.Taken
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

export function isTaken(parcel) {
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
