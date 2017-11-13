import types from "./types";

const INITIAL_STATE = {
  web3Connected: false,
  addressState: { loading: true },

  parcelStates: { loading: true },
  pendingConfirmationBids: [],

  modal: {
    open: false,
    name: "",
    data: null
  }
};

export const selectors = {
  getWeb3Connected(state) {
    return state.web3Connected;
  },
  getAddressState(state) {
    return state.addressState;
  },
  getParcelStates(state) {
    return state.parcelStates;
  },
  getPendingConfirmationBids(state) {
    return state.pendingConfirmationBids;
  },
  getModal(state) {
    return state.modal;
  }
};

function web3Connected(state = INITIAL_STATE.web3Connected, action) {
  switch (action.type) {
    case types.connectWeb3.success:
      return true;
    case types.connectWeb3.failed:
      return false;
    default:
      return state;
  }
}

function addressState(state = INITIAL_STATE.addressState, action) {
  switch (action.type) {
    case types.fetchAddressState.request:
      return { loading: true };
    case types.fetchAddressState.success:
      action.addressState.balance = parseFloat(action.addressState.balance, 10);
      return { loading: false, data: action.addressState };
    case types.fetchAddressState.failed:
      return { loading: false, error: action.error };
    case types.appendUnconfirmedBid:
      if (state.data) {
        return {
          ...state,
          data: {
            ...state.data,
            balance: state.data.balance - action.bid.yourBid
          }
        };
      } else {
        return state;
      }
    case types.deleteUnconfirmedBid:
      if (state.data) {
        return {
          ...state,
          data: {
            ...state.data,
            balance: state.data.balance + action.bid.yourBid
          }
        };
      } else {
        return state;
      }
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

function pendingConfirmationBids(
  state = INITIAL_STATE.pendingConfirmationBids,
  action
) {
  const filterActionBid = () =>
    state.filter(bid => bid.x !== action.bid.x || bid.y !== action.bid.y);

  // TODO: LocalStorage?
  switch (action.type) {
    case types.appendUnconfirmedBid:
      return [...filterActionBid(), action.bid];
    case types.deleteUnconfirmedBid:
      return filterActionBid();
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
  web3Connected,
  addressState,
  parcelStates,
  pendingConfirmationBids,
  modal
};
