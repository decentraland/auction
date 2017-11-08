import types from "./types";

export default {
  parcelStates: (state = {}, action) => {
    let newParcelStates
    switch (action.type) {
      case types.fetchParcels.request:
        newParcelStates = { ...state }
        for (let newParcel of action.parcels) {
          newParcelStates[newParcel] = { loading: true }
        }
        return newParcelStates
      case types.fetchParcels.success:
        newParcelStates = { ...state }
        for (let newParcel of action.parcelStates) {
          newParcelStates[newParcel.id] = { loading: false, data: newParcel }
        }
        return newParcelStates
      default:
        return state;
    }
  }
};

export const selectors = {
  getParcelStates(state) {
    return state["parcelStates"];
  }
};
