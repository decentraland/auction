import types from "./types";

const INITIAL_STATE = {
  ethereum: { loading: true },
  manaBalance: { loading: true },
  parcelStates: { loading: true },

  modal: {
    open: false,
    name: "",
    data: null
  }
};

export const selectors = {
  getEthereum(state) {
    return state.ethereum;
  },
  getParcelStates(state) {
    return state.parcelStates;
  },
  getManaBalance(state) {
    return state.manaBalance;
  },
  getModal(state) {
    return state.modal;
  }
};

function ethereum(state = INITIAL_STATE.ethereum, action) {
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

function manaBalance(state = INITIAL_STATE.manaBalance, action) {
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

function parcelStates(state = INITIAL_STATE.parcelStates, action) {
  switch (action.type) {
    case types.fetchParcels.request:
      return { ...state, loading: true };
    case types.fetchParcels.success:
      return action.parcelStates.reduce(
        (total, parcel) => ({
          ...total,
          [`${parcel.x},${parcel.y}`]: parcel
        }),
        { ...state, loading: false }
      );
    case types.fetchParcels.failed:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

function modal(state = INITIAL_STATE.modal, action) {
  switch (action.type) {
    case types.modal.open:
      return {
        open: true,
        name: action.name,
        data: action.data
      };
    case types.modal.close:
      return INITIAL_STATE.modal;
    default:
      return state;
  }
}

export default {
  ethereum,
  parcelStates,
  manaBalance,
  modal
};
