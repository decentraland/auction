import types from "./types";

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
