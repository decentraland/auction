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

export function fetchParcelStateRange(mincoords, maxcoords) {
  return {
    type: types.fetchParcelStateRange,
    mincoords,
    maxcoords
  };
}

export function setParcelStates(parcelStates) {
  return {
    type: types.setParcelStates,
    parcelStates
  };
}
