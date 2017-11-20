import tinycolor2 from "tinycolor2";

import { ONE_LAND_IN_MANA } from "./land";
import { buildCoordinate } from "./util";
import * as addressStateUtils from "./addressStateUtils";

export function getBidStatus(parcel, ownerAddress) {
  if (!parcel || !parcel.endsAt) return "";

  let status = "";

  const ended = hasEnded(parcel);
  const byAddress = parcel.address === ownerAddress;

  if (ended) {
    status = byAddress ? "Won" : "Lost";
  } else {
    status = byAddress ? "Winning" : "Outbid";
  }
  return status;
}

export function hasEnded(parcel) {
  return parcel.endsAt && Date.now() >= parcel.endsAt.getTime();
}

export const COLORS = {
  Won: "#30D7A9",
  Winning: "#30D7A9",
  Lost: "#AE4DE8",
  Outbid: "#AE4DE8",
  Taken: "#3E396B",
  LittleValue: "#EAFF28",
  BigValue: "#FF1111",
  Default: "#EAEAEA",
  Loading: "#D0D0D0"
};

export function getColor(parcel, addressState) {
  if (!parcel || parcel.error) return COLORS.Loading;
  if (isTaken(parcel)) return COLORS.Taken;
  if (!parcel.amount) return COLORS.Default;

  let color = "";

  if (addressStateUtils.hasBidInParcel(addressState, parcel)) {
    const status = getBidStatus(parcel, addressState.address);
    color = COLORS[status] || COLORS.Default;
  } else if (hasEnded(parcel)) {
    color = COLORS.Taken;
  } else {
    // toHsv() => { h: 0, s: 1, v: 1, a: 1 }
    const minHSV = tinycolor2(COLORS.LittleValue).toHsv();
    const maxHSV = tinycolor2(COLORS.BigValue).toHsv();

    const h = calulateColorValue(parcel, minHSV.h, maxHSV.h);
    const s = calulateColorValue(parcel, minHSV.s, maxHSV.s);

    color = tinycolor2({ h, s, v: 1, a: 1 }).toHexString();
  }

  return color;
}

export function isTaken(parcel) {
  return !!parcel.projectId;
}

function calulateColorValue(parcel, minValue, maxValue) {
  const priceRate = parcel.amount - ONE_LAND_IN_MANA;
  return (maxValue - minValue) * parcel.amount / (priceRate + minValue);
}

export function generateMatrix(minX, minY, maxX, maxY) {
  const matrix = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      matrix.push(buildCoordinate(x, y));
    }
  }
  return matrix;
}

export function getBounds() {
  return {
    minX: -160,
    minY: -160,
    maxX: 160,
    maxY: 160
  };
}
