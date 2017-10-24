import types from "./types";

export default {
  parcelStates: (state = { parcelStates: [] }, action) => {
    switch (action.type) {
      case types.setParcelStates:
        return Object.assign({}, state, { parcelStates: action.parcelStates });
      default:
        return state;
    }
  }
};
