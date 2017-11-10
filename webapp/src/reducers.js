import types from "./types";

export const selectors = {
  getEthereum(state) {
    return state.ethereum;
  },
  getParcelStates(state) {
    return state.parcelStates;
  },
  getManaBalance(state) {
    return state.manaBalance;
  }
};

function ethereum(state = { loading: true }, action) {
  switch (action.type) {
    case types.connectWeb3.request:
      return { loading: true };
    case types.connectWeb3.success:
      return { loading: false, success: true };
    case types.connectWeb3.failed:
      return { loading: false, error: action.error };
    default:
      return state;
  }
}

function manaBalance(state = { loading: true }, action) {
  switch (action.type) {
    case types.fetchManaBalance.request:
      return { loading: true };
    case types.fetchManaBalance.success:
      return { loading: false, data: action.manaBalance };
    case types.fetchManaBalance.failed:
      return { loading: false, error: action.error };
    default:
      return state;
  }
}

function parcelStates(state = {}, action) {
  let newState;

  switch (action.type) {
    case types.fetchParcels.request:
      return { ...state, loading: true };
    case types.fetchParcels.many:
      newState = { ...state, loading: false };
      action.parcels.forEach(parcel => {
        newState[`${parcel.x},${parcel.y}`] = parcel;
      });
      return newState;
    case types.fetchParcels.failed:
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export default {
  ethereum,
  parcelStates,
  manaBalance
};
