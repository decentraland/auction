import types from "./types";

export default {
  fetchParcelStateRange(mincoords, maxcoords) {
    return {
      type: types.fetchParcelStateRange,
      mincoords,
      maxcoords
    };
  },
  setParcelStateRange(parcelStates) {
    return {
      type: types.setParcelStates,
      parcelStates
    };
  }
};
