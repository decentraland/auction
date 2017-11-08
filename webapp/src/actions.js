import types from "./types";

// -------------------------------------------------------------------------
// Web3

export function connectWeb3(address) {
  return {
    type: types.connectWeb3.REQUEST,
    address
  };
}

// -------------------------------------------------------------------------
// Parcel States

export function fetchParcelStateRange(minX, maxX, minY, maxY) {
  return {
    type: types.fetchParcelStateRange,
    minX, maxX,
    minY, maxY
  };
}

export function setParcelStates(parcelStates) {
  return {
    type: types.setParcelStates,
    parcelStates
  };
}
