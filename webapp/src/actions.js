import types from "./types";
import { push } from "react-router-redux";

// -------------------------------------------------------------------------
// Web3

export function connectWeb3(address) {
  return {
    type: types.connectWeb3.request,
    address
  };
}

// -------------------------------------------------------------------------
// Parcel States

export function parcelRangeChange(minX, maxX, minY, maxY) {
  return {
    type: types.parcelRangeChanged,
    minX,
    maxX,
    minY,
    maxY
  };
}

export function clickParcel(x, y) {
  return {
    type: types.clickParcel,
    x,
    y
  };
}

// -------------------------------------------------------------------------
// Bids

export function appendUnconfirmedBid(bid) {
  return {
    type: types.appendUnconfirmedBid,
    bid
  };
}

export function deleteUnconfirmedBid(bid) {
  return {
    type: types.deleteUnconfirmedBid,
    bid
  };
}

export function fetchOngoingAuctions() {
  return {
    type: types.fetchOngoingAuctions.request
  };
}

export function confirmBids(bids) {
  return {
    type: types.confirmBids.request,
    bids
  };
}

// -------------------------------------------------------------------------
// Modal

export function openModal(name, data) {
  return {
    type: types.modal.open,
    name,
    data
  };
}

export function closeModal() {
  return {
    type: types.modal.close
  };
}

// -------------------------------------------------------------------------
// Locations

export function locationChange(url) {
  return push(url);
}
