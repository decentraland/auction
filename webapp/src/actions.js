import types from "./types";

// -------------------------------------------------------------------------
// Web3

export function connectWeb3(address) {
  return {
    type: types.connectWeb3.request,
    address
  };
}

// -------------------------------------------------------------------------
// Parcel States

export function parcelRangeChange(minX, maxX, minY, maxY) {
  return {
    type: types.parcelRangeChanged,
    minX, maxX,
    minY, maxY
  };
}
