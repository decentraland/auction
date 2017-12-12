import { createSelector } from 'reselect'

import types from './types'
import localStorage from './lib/localStorage'

const INITIAL_STATE = {
  web3Connected: false,

  addressState: { loading: true },

  projects: { loading: true },

  range: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0
  },

  parcelStates: { loading: true }, // doest NOT use a `data` property
  pendingConfirmationBids: { data: [] },

  ongoingAuctions: { loading: true },

  modal: {
    open: false,
    name: '',
    data: null
  },

  email: {
    data: localStorage.getItem('email') || ''
  },

  shift: {
    never: true,
    pressed: false
  },

  sidebar: {
    open: false
  }
}

function getWeb3Connected(state) {
  return state.web3Connected
}
function getAddressState(state) {
  return state.addressState
}
function getAddressStateData(state) {
  return state.addressState.data
}
function getProjects(state) {
  return state.projects
}
function getProjectsData(state) {
  return state.projects.data
}
function getParcelStates(state) {
  return state.parcelStates
}

const getMaxAmount = createSelector([getParcelStates],
  parcelStates => parcelStates && !parcelStates.loading
  ? Object.values(parcelStates).reduce(
      (prev, next) => next && next.amount ? Math.max(prev, next.amount) : prev,
      0
    )
  : 1000
)

function getPendingConfirmationBids(state) {
  return state.pendingConfirmationBids
}
function getPendingConfirmationBidsData(state) {
  return state.pendingConfirmationBids.data
}
function getOngoingAuctions(state) {
  return state.ongoingAuctions
}
function getModal(state) {
  return state.modal
}
function getEmail(state) {
  return state.email
}
function getSidebar(state) {
  return state.sidebar
}
function getShift(state) {
  return state.shift
}
function getRange(state) {
  return state.range
}

export const selectors = {
  getWeb3Connected,
  getAddressState,
  getAddressStateData,
  getProjects,
  getProjectsData,
  getParcelStates,
  getMaxAmount,
  getPendingConfirmationBids,
  getPendingConfirmationBidsData,
  getOngoingAuctions,
  getModal,
  getEmail,
  getSidebar,
  getShift,
  getRange,
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

function range(state = INITIAL_STATE.range, action) {
  switch (action.type) {
    case types.parcelRangeChanged:
      return action
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
      return {
        loading: false,
        data: {
          ...action.addressState,
          totalBalance: parseFloat(action.addressState.totalBalance, 10),
          balance: parseFloat(action.addressState.balance, 10)
        }
      }
    case types.fetchAddressState.failed:
      return { loading: false, error: action.error }
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
      const result = { ...state, loading: false, error: null }
      action.parcelStates.forEach(parcel => {
        result[`${parcel.x},${parcel.y}`] = parcel
      })
      return result
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
  const isActionBid = bid => bid.x === action.bid.x && bid.y === action.bid.y

  switch (action.type) {
    case types.appendUnconfirmedBid:
      return {
        data: state.data.find(isActionBid)
          ? state.data.map(bid => (isActionBid(bid) ? action.bid : bid))
          : [...state.data, action.bid]
      }
    case types.deleteUnconfirmedBid:
      return {
        data: state.data.filter(bid => !isActionBid(bid))
      }
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

function sidebar(state = INITIAL_STATE.sidebar, action) {
  switch (action.type) {
    case types.sidebar.open:
      return {
        open: true
      }
    case types.sidebar.close:
      return INITIAL_STATE.sidebar
    default:
      return state
  }
}

function shift(state = INITIAL_STATE.shift, action) {
  switch (action.type) {
    case types.shift.up:
      return {
        never: false,
        pressed: false
      }
    case types.shift.down:
      return {
        never: false,
        pressed: true
      }
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
  sidebar,
  shift,
  range
}

export function analytics(state, action) {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE':
      return null
    case types.fetchParcels.success:
      return Object.assign({}, action, {
        parcelStates: action.parcelStates.length
      })
    case types.fetchProjects.success:
      return Object.assign({}, action, { projects: action.projects.length })
    default:
      return action
  }
}
