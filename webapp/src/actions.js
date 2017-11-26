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

// -------------------------------------------------------------------------
// Bids

export function intentUnconfirmedBid(bid) {
  return {
    type: types.intentUnconfirmedBid,
    bid
  }
}

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

export function changeLocation(url) {
  return {
    type: types.changeLocation,
    url
  }
}

// -------------------------------------------------------------------------
// Menu

export function openMenu() {
  return {
    type: types.menu.open
  }
}

export function closeMenu() {
  return {
    type: types.menu.close
  }
}

