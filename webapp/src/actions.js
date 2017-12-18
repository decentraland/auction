import types from './types'

// -------------------------------------------------------------------------
// Web3

export function connectWeb3(address) {
  return {
    type: types.connectWeb3.request,
    address
  }
}

// -------------------------------------------------------------------------
// Loading

export function setLoading(loading = false) {
  return {
    type: types.setLoading,
    loading
  }
}

// -------------------------------------------------------------------------
// Projects

export function fetchProjects() {
  return {
    type: types.fetchProjects.request
  }
}

// -------------------------------------------------------------------------
// Parcel States

export function parcelRangeChange(minX, minY, maxX, maxY) {
  return {
    type: types.parcelRangeChanged,
    minX,
    minY,
    maxX,
    maxY
  }
}

export function clickParcel(x, y) {
  return {
    type: types.clickParcel,
    x,
    y
  }
}

export function fastBid(parcel) {
  return {
    type: types.fastBid,
    parcel
  }
}

// -------------------------------------------------------------------------
// Bids

export function appendUnconfirmedBid(bid) {
  return {
    type: types.appendUnconfirmedBid,
    bid
  }
}

export function deleteUnconfirmedBid(bid) {
  return {
    type: types.deleteUnconfirmedBid,
    bid
  }
}

export function fetchOngoingAuctions() {
  return {
    type: types.fetchOngoingAuctions.request
  }
}

export function confirmBids(bids) {
  return {
    type: types.confirmBids.request,
    bids
  }
}

// -------------------------------------------------------------------------
// Stats

export function fetchStats() {
  return {
    type: types.fetchStats.request
  }
}

// -------------------------------------------------------------------------
// Modal

export function openModal(name, data) {
  return {
    type: types.modal.open,
    name,
    data
  }
}

export function closeModal() {
  return {
    type: types.modal.close
  }
}

// -------------------------------------------------------------------------
// Locations

export function navigateTo(url) {
  return {
    type: types.navigateTo,
    url
  }
}

// -------------------------------------------------------------------------
// Email

export function subscribeEmail(email) {
  return {
    type: types.subscribeEmail.request,
    email
  }
}

export function unsubscribeEmail() {
  return {
    type: types.unsubscribeEmail.request
  }
}

// -------------------------------------------------------------------------
// Sidebar

export function openSidebar() {
  return {
    type: types.sidebar.open
  }
}

export function closeSidebar() {
  return {
    type: types.sidebar.close
  }
}

// -------------------------------------------------------------------------
// Shift key

export function shiftDown() {
  return {
    type: types.shift.down
  }
}

export function shiftUp() {
  return {
    type: types.shift.up
  }
}
