import types from './types'

const INITIAL_STATE = {
  web3Connected: false,

  addressState: { loading: true },

  projects: { loading: true },

  parcelStates: { loading: true }, // doest NOT use a `data` property
  pendingConfirmationBids: { data: [] },

  ongoingAuctions: { loading: true },

  modal: {
    open: false,
    name: '',
    data: null
  },

  email: {
    data: window.localStorage ? window.localStorage.getItem('email') : ''
  },

  menu: {
    open: false
  }
}

export const selectors = {
  getWeb3Connected(state) {
    return state.web3Connected
  },
  getAddressState(state) {
    return state.addressState
  },
  getAddressStateData(state) {
    return state.addressState.data
  },
  getProjects(state) {
    return state.projects
  },
  getProjectsData(state) {
    return state.projects.data
  },
  getParcelStates(state) {
    return state.parcelStates
  },
  getPendingConfirmationBids(state) {
    return state.pendingConfirmationBids
  },
  getOngoingAuctions(state) {
    return state.ongoingAuctions
  },
  getModal(state) {
    return state.modal
  },
  getEmail(state) {
    return state.email
  },
  getMenu(state) {
    return state.menu
  }
}

function web3Connected(state = INITIAL_STATE.web3Connected, action) {
  switch (action.type) {
    case types.connectWeb3.success:
      return true
    case types.connectWeb3.failed:
      return false
    default:
      return state
  }
}

function addressState(state = INITIAL_STATE.addressState, action) {
  switch (action.type) {
    case types.addressStateLoading:
      return { ...state, loading: action.loading }
    case types.fetchAddressState.request:
      return { loading: true }
    case types.fetchAddressState.success:
      action.addressState.balance = parseFloat(action.addressState.balance, 10)
      return { loading: false, data: action.addressState }
    case types.fetchAddressState.failed:
      return { loading: false, error: action.error }
    case types.appendUnconfirmedBid:
      if (state.data) {
        return {
          ...state,
          data: {
            ...state.data,
            balance: state.data.balance - action.bid.yourBid
          }
        }
      } else {
        return state
      }
    case types.deleteUnconfirmedBid:
      if (state.data) {
        return {
          ...state,
          data: {
            ...state.data,
            balance: state.data.balance + action.bid.yourBid
          }
        }
      } else {
        return state
      }
    default:
      return state
  }
}

function projects(state = INITIAL_STATE.projects, action) {
  switch (action.type) {
    case types.fetchProjects.request:
      return { loading: true }
    case types.fetchProjects.success:
      return { loading: false, data: action.projects }
    case types.fetchProjects.failed:
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}
function parcelStates(state = INITIAL_STATE.parcelStates, action) {
  switch (action.type) {
    case types.fetchParcels.request:
      return { ...state, loading: true, error: null }
    case types.fetchParcels.success:
      return action.parcelStates.reduce(
        (total, parcel) => ({
          ...total,
          [`${parcel.x},${parcel.y}`]: parcel
        }),
        { ...state, loading: false, error: null }
      )
    case types.fetchParcels.failed:
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}

function pendingConfirmationBids(
  state = INITIAL_STATE.pendingConfirmationBids,
  action
) {
  const filterActionBid = () =>
    state.data.filter(bid => bid.x !== action.bid.x || bid.y !== action.bid.y)

  // TODO: LocalStorage?
  switch (action.type) {
    case types.appendUnconfirmedBid:
      return { data: [...filterActionBid(), action.bid] }
    case types.deleteUnconfirmedBid:
      return { data: filterActionBid() }
    case types.confirmBids.success:
      return INITIAL_STATE.pendingConfirmationBids
    case types.confirmBids.failed:
      return { ...state, error: action.error }
    default:
      return state
  }
}

function ongoingAuctions(state = INITIAL_STATE.ongoingAuctions, action) {
  switch (action.type) {
    case types.fetchOngoingAuctions.request:
      return { loading: true }
    case types.fetchOngoingAuctions.success:
      return { loading: false, data: action.ongoingAuctions }
    case types.fetchOngoingAuctions.failed:
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}

function modal(state = INITIAL_STATE.modal, action) {
  switch (action.type) {
    case types.modal.open:
      return {
        open: true,
        name: action.name,
        data: action.data
      }
    case types.modal.close:
      return INITIAL_STATE.modal
    default:
      return state
  }
}

function email(state = INITIAL_STATE.email, action) {
  switch (action.type) {
    case types.registerEmail.success:
      return {
        data: action.data
      }
    case types.deregisterEmail.success:
      return {
        data: ''
      }
    default:
      return state
  }
}

function menu(state = INITIAL_STATE.menu, action) {
  switch (action.type) {
    case types.menu.open:
      return {
        open: true
      }
    case types.menu.close:
      return INITIAL_STATE.menu
    default:
      return state
  }
}

export default {
  web3Connected,
  addressState,
  projects,
  parcelStates,
  pendingConfirmationBids,
  ongoingAuctions,
  modal,
  email,
  menu
}
