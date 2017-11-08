import types from "./types";

export default {
  parcelStates: (state = { parcelStates: [] }, action) => {
    switch (action.type) {
      case types.fetchParcels.success:
        const newParcelStates = Object.assign({}, state.parcelStates)
        for (let newParcel of action.parcelStates) {
          newParcelStates[newParcel.id] = newParcel
        }
        return { ...state, parcelStates: newParcelStates }
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
