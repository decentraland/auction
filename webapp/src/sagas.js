import { delay } from 'redux-saga'
import { call, takeLatest, select, takeEvery, put } from 'redux-saga/effects'
import { push, replace } from 'react-router-redux'

import { eth } from 'decentraland-commons'

import locations from './locations'
import types from './types'
import { selectors } from './reducers'
import { buildCoordinate } from './lib/util'
import * as addressStateUtils from './lib/addressStateUtils'
import * as parcelUtils from './lib/parcelUtils'
import api from './lib/api'

// TODO: We need to avoid having a infinite spinner when an error occurs and the user navigates back to the root location.
//       We can listen to URL changes and try to load web3 in that particular case
function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3)

  yield takeEvery(types.changeLocation, handleLocationChange)

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange)
  yield takeLatest(types.fetchParcels.request, handleParcelFetchRequest)

  yield takeLatest(types.connectWeb3.success, handleAddressFetchRequest)
  yield takeLatest(types.fetchManaBalance.request, handleAddressFetchRequest)

  yield takeLatest(types.fetchAddressState.request, handleAddressFetchRequest)
  yield takeLatest(types.fetchAddressState.reload, handleAddressFetchReload)

  yield takeEvery(types.fetchProjects.request, handleProjectsFetchRequest)

  yield takeEvery(types.intentUnconfirmedBid, handleIntentUnconfirmedBid)

  yield takeEvery(
    types.fetchOngoingAuctions.request,
    handleOngoingAuctionsFetchRequest
  )

  yield takeLatest(types.confirmBids.request, handleAddresStateStartLoading)
  yield takeLatest(types.confirmBids.request, handleConfirmBidsRequest)
  yield takeLatest(types.confirmBids.success, handleAddressFetchRequest)
  yield takeLatest(types.confirmBids.success, handleEmailRegisterBids)
  yield takeLatest(types.confirmBids.failed, handleAddresStateFinishLoading)

  yield takeLatest(types.registerEmail.request, handleEmailRegister)
  yield takeLatest(types.deregisterEmail.request, handleEmailDeregister)
}

// -------------------------------------------------------------------------
// Web3

function* connectWeb3(action = {}) {
  try {
    let retries = 0
    let connected = yield call(() => eth.reconnect(action.address))

    while (!connected && retries <= 3) {
      yield delay(1500)
      connected = yield call(() => eth.connect(action.address))
      retries += 1
    }

    if (!connected) throw new Error('Could not connect to web3')

    yield put({
      type: types.connectWeb3.success,
      web3Connected: true,
      address: eth.getAddress()
    })
  } catch (error) {
    yield put(replace(locations.walletError))
    yield put({ type: types.connectWeb3.failed, message: error.message })
  }
}

// -------------------------------------------------------------------------
// Location

function* handleLocationChange(action) {
  yield put(push(action.url))
}

// -------------------------------------------------------------------------
// Address States

function* handleAddressFetchRequest(action) {
  try {
    const addressState = yield fetchAddressState()
    yield put({ type: types.fetchAddressState.success, addressState })
  } catch (error) {
    yield put(replace(locations.addressError))
    yield put({
      type: types.fetchAddressState.failed,
      error: error.message
    })
  }
}

function* handleAddressFetchReload(action) {
  try {
    const addressState = yield fetchAddressState()
    Object.assign({ bidGroups: [], latestBidGroupId: null }, addressState)
    yield put({ type: types.fetchAddressState.success, addressState })
  } catch (error) {
    // Let it slide
    console.warn(error)
  }
}

function* fetchAddressState() {
  const web3Connected = yield select(selectors.getWeb3Connected)

  if (!web3Connected) {
    throw new Error(
      'Tried to get the MANA balance without connecting to ethereum first'
    )
  }

  const addressState = yield call(() =>
    api.fetchFullAddressState(eth.getAddress())
  )

  if (!addressState) {
    throw new Error(
      "We couldn't retrieve any account information for your current address."
    )
  }

  return addressState
}

function* handleAddresStateStartLoading(action) {
  yield put({ type: types.addressStateLoading, loading: true })
}

function* handleAddresStateFinishLoading(action) {
  yield put({ type: types.addressStateLoading, loading: false })
}

// -------------------------------------------------------------------------
// Projects

function* handleProjectsFetchRequest(action) {
  try {
    const projects = yield call(() => api.fetchProjects())

    yield put({ type: types.fetchProjects.success, projects })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.fetchProjects.failed, error: error.message })
  }
}

// -------------------------------------------------------------------------
// Parcel States

function* handleParcelFetchRequest(action) {
  try {
    const parcelStates = yield call(() => api.fetchParcelStates(action.parcels))

    for (let coordinate in parcelStates) {
      const parcel = parcelStates[coordinate]
      parcel.amount = parseFloat(parcel.amount, 10) || null
      parcel.endsAt = parcel.endsAt ? new Date(parcel.endsAt) : null
    }

    yield put({ type: types.fetchParcels.success, parcelStates })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.fetchParcels.failed, error: error.message })
  }
}

function* handleParcelRangeChange(action) {
  const parcelStates = yield select(selectors.getParcelStates)
  const { minX, minY, maxX, maxY } = action

  // For each parcel in screen, if it is not loaded, request to fetch it
  // For parcels already loaded, we don't care in here
  const parcelsToFetch = parcelUtils
    .generateMatrix(minX, minY, maxX, maxY)
    .filter(coordinate => !parcelStates[coordinate])

  if (parcelsToFetch.length) {
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch })
  }
}

// -------------------------------------------------------------------------
// Bids

function* handleOngoingAuctionsFetchRequest(action) {
  try {
    let parcelStates = yield select(selectors.getParcelStates)
    let addressState = yield select(selectors.getAddressStateData)

    const address = addressState.address
    const ongoingAuctions = []

    const bidCoordinates = addressStateUtils.getBidCoordinates(addressState)

    if (bidCoordinates.length) {
      yield call(() => handleParcelFetchRequest({ parcels: bidCoordinates }))
      parcelStates = yield select(selectors.getParcelStates)
    }

    for (const coordinate of bidCoordinates) {
      const parcel = parcelStates[coordinate]
      const status = parcelUtils.getBidStatus(parcel, address)

      ongoingAuctions.push({
        address,
        status,
        x: parcel.x,
        y: parcel.y,
        amount: parcel.amount,
        endsAt: parcel.endsAt
      })
    }

    yield put({ type: types.fetchOngoingAuctions.success, ongoingAuctions })
  } catch (error) {
    console.warn(error)
    yield put({
      type: types.fetchOngoingAuctions.failed,
      error: error.message
    })
  }
}

function* handleConfirmBidsRequest(action) {
  const addressState = yield select(selectors.getAddressState)
  const { address, bidGroups } = addressState.data
  const bids = action.bids

  try {
    const payload = buildBidsSignPayload(bids)
    const message = eth.utils.toHex(payload)
    const signature = yield call(() => eth.remoteSign(message, address))
    const nonce = getBidGroupsNonce(bidGroups)

    const bidGroup = { address, bids, message, signature, nonce }
    yield call(() => api.postBidGroup(bidGroup))

    const parcelsToFetch = bids.map(bid => buildCoordinate(bid.x, bid.y))

    yield put({ type: types.confirmBids.success, bids: bids })
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.confirmBids.failed, error: error.message })

    // Re-fetch the address state to avoid outdated confirmation errors
    yield put({ type: types.fetchAddressState.reload })
  }
}

function buildBidsSignPayload(bids) {
  const payloadBids = bids
    .map(bid => `\t- (${buildCoordinate(bid.x, bid.y)}) for ${bid.amount} MANA`)
    .join('\t\n')

  return `Bids (${bids.length}):
${payloadBids}
Time: ${new Date().getTime()}`
}

function getBidGroupsNonce(bidGroups) {
  if (!bidGroups || bidGroups.length <= 0) {
    return 0
  }

  const nonces = bidGroups.map(bidGroup => bidGroup.nonce).sort() // DESC
  return nonces.pop() + 1
}

// -------------------------------------------------------------------------
// Email

function* handleEmailRegister(action) {
  const email = action.data
  const ongoingAuctions = yield select(selectors.getOngoingAuctions)
  const parcelStateIds = ongoingAuctions.data.map(bid => `${bid.x},${bid.y}`)

  try {
    if (parcelStateIds.length > 0) {
      yield call(() => api.postOutbidNotification(email, parcelStateIds))
    }
    if (window.localStorage) {
      window.localStorage.setItem('email', email)
    }
    yield put({ type: types.registerEmail.success, data: email })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.registerEmail.failed, error: error.message })
  }
}

function* handleEmailDeregister(action) {
  const email = yield select(selectors.getEmail)

  try {
    yield call(() => api.deleteOutbidNotification(email.data))
    if (window.localStorage) {
      window.localStorage.removeItem('email')
    }
    yield put({ type: types.deregisterEmail.success })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.deregisterEmail.failed, error: error.message })
  }
}

function* handleEmailRegisterBids(action) {
  const email = yield select(selectors.getEmail)
  const parcelStateIds = action.bids.map(bid => `${bid.x},${bid.y}`)

  if (email.data) {
    yield call(() => api.postOutbidNotification(email.data, parcelStateIds))
  }
}

function* handleIntentUnconfirmedBid(action) {
  const pendingConfirmationBids = yield select(
    selectors.getPendingConfirmationBids
  )

  const exists =
    pendingConfirmationBids.data.filter(
      bid => bid.x === action.bid.x && bid.y === action.bid.y
    ).length > 0

  if (!exists) {
    yield put({ type: types.appendUnconfirmedBid, bid: action.bid })
  }
}

export default rootSaga
