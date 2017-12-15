import { delay } from 'redux-saga'
import { call, takeLatest, select, takeEvery, put } from 'redux-saga/effects'
import { push, replace } from 'react-router-redux'

import { eth, env } from 'decentraland-commons'

import locations from './locations'
import types from './types'
import { selectors } from './reducers'

import { buildCoordinate } from './lib/util'
import * as addressStateUtils from './lib/addressStateUtils'
import * as parcelUtils from './lib/parcelUtils'
import * as pendingBidsUtils from './lib/pendingBidsUtils'
import api from './lib/api'

// TODO: We need to avoid having a infinite spinner when an error occurs and the user navigates back to the root location.
//       We can listen to URL changes and try to load web3 in that particular case
function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3)

  yield takeEvery(types.navigateTo, handleLocationChange)

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange)

  yield takeLatest(types.fetchParcels.request, handleParcelFetchRequest)
  yield takeEvery(types.fetchParcels.failed, retryParcelFetch)

  yield takeLatest(types.connectWeb3.success, handleAddressFetchRequest)
  yield takeLatest(types.fetchManaBalance.request, handleAddressFetchRequest)
  yield takeLatest(types.fetchAddressState.request, handleAddressFetchRequest)

  yield takeEvery(types.fetchProjects.request, handleProjectsFetchRequest)

  yield takeEvery(types.appendUnconfirmedBid, handleAddressUpdateBalance)

  yield takeEvery(types.fastBid, handleFastBid)

  yield takeEvery(
    types.fetchOngoingAuctions.request,
    handleOngoingAuctionsFetchRequest
  )

  yield takeLatest(types.confirmBids.request, handleAddresStateStartLoading)
  yield takeLatest(types.confirmBids.request, handleConfirmBidsRequest)

  yield takeLatest(types.confirmBids.success, handleAddressFetchRequest)
  yield takeLatest(types.confirmBids.success, handleEmailRegisterBids)

  yield takeEvery(types.confirmBids.success, handleOngoingAuctionsFetchRequest)
  yield takeEvery(types.confirmBids.failed, handleOngoingAuctionsFetchRequest)

  yield takeLatest(types.confirmBids.failed, handleAddressFetchReload)
  yield takeLatest(types.confirmBids.failed, handleAddresStateFinishLoading)

  yield takeLatest(types.subscribeEmail.request, handleEmailSubscribe)
  yield takeLatest(types.unsubscribeEmail.request, handleEmailUnsubscribe)

  yield takeLatest(types.subscribeEmail.success, handleAddressFetchReload)
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
    yield handleAddressUpdateBalance({ addressState })
  } catch (error) {
    // Let it slide
    console.warn(error)
  }
}

function* handleAddressUpdateBalance(action) {
  const pendingConfirmationBids = yield select(
    selectors.getPendingConfirmationBidsData
  )
  const addressState = action.addressState
    ? action.addressState
    : yield select(selectors.getAddressStateData)

  const pendingMana = pendingBidsUtils.getTotalManaBidded(
    pendingConfirmationBids
  )

  addressState.balance = addressState.totalBalance - pendingMana

  yield put({ type: types.fetchAddressState.success, addressState })
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

  return Object.assign(
    {
      bidGroups: [],
      latestBidGroupId: null,
      totalBalance: addressState.balance
    },
    addressState
  )
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

function* retryParcelFetch(action) {
  if (action.retry > 3) {
    yield put(replace(locations.serverError))
    return
  }
  yield delay(2000 * action.retry)
  yield call(handleParcelFetchRequest, action)
}

function* handleParcelFetchRequest(action) {
  try {
    const parcelStates = yield call(() => api.fetchParcelStates(action.parcels))

    for (let coordinate in parcelStates) {
      const parcel = parcelStates[coordinate]
      parcel.amount = parseFloat(parcel.amount, 10) || null
      parcel.endsAt = parcel.endsAt ? new Date(parcel.endsAt) : null
    }

    yield put({ type: types.fetchParcels.success, parcelStates })
    yield put({ type: types.setLoading, loading: false })
  } catch (error) {
    console.warn(error)
    yield put({
      type: types.fetchParcels.failed,
      error: error.message,
      parcels: action.parcels,
      retry: (action.retry || 0) + 1
    })
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

    const ongoingAuctions = []

    const bidCoordinates = addressStateUtils.getBidCoordinates(addressState)

    if (bidCoordinates.length) {
      yield call(() => handleParcelFetchRequest({ parcels: bidCoordinates }))
      parcelStates = yield select(selectors.getParcelStates)
    }

    for (const coordinate of bidCoordinates) {
      const parcel = parcelStates[coordinate]
      const status = parcelUtils.getBidStatus(parcel, addressState)

      ongoingAuctions.push({
        status,
        address: addressState.address,
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
  const { address, bidGroups } = yield select(selectors.getAddressStateData)
  const bids = action.bids
  const parcels = bids.map(bid => buildCoordinate(bid.x, bid.y))

  try {
    const payload = buildBidsSignPayload(bids)
    const message = eth.utils.toHex(payload)
    const signature = yield call(() => eth.remoteSign(message, address))

    const bidGroup = {
      address,
      bids,
      message,
      signature,
      nonce: getBidGroupsNonce(bidGroups)
    }
    yield call(() => api.postBidGroup(bidGroup))

    yield put({ type: types.confirmBids.success, bids })
  } catch (error) {
    console.warn(error)
    yield put({
      type: types.confirmBids.failed,
      error: error.data || error.message
    })
  }

  yield put({ type: types.fetchParcels.request, parcels })
}

function buildBidsSignPayload(bids) {
  const header = env.isDevelopment() ? 'MOCK AUCTION' : ''

  const payloadBids = bids
    .map(bid => `\t- (${buildCoordinate(bid.x, bid.y)}) for ${bid.amount} MANA`)
    .join('\t\n')

  return `${header}
Bids (${bids.length}):
${payloadBids}
Time: ${new Date().getTime()}`
}

function getBidGroupsNonce(bidGroups) {
  if (!bidGroups || bidGroups.length <= 0) {
    return 0
  }

  const nonces = bidGroups.map(bidGroup => bidGroup.nonce).sort((a, b) => a - b) // DESC

  return nonces.pop() + 1
}

function* handleFastBid(action) {
  const parcel = action.parcel
  if (parcel.projectId) {
    // TODO: Show message, can't bid on project
    return
  }

  const { x, y } = parcel
  const amount = parcelUtils.minimumBid(parcel.amount)
  const addressState = yield select(selectors.getAddressState)

  if (addressState.loading || !addressState.data.balance) {
    // TODO: Balance not loaded?
    return
  }
  if (amount > addressState.data.balance) {
    // TODO: Not enough balance
    return
  }

  yield put({
    type: types.appendUnconfirmedBid,
    bid: {
      x,
      y,
      address: addressState.data.address,
      currentBid: parcel.amount,
      yourBid: amount,
      endsAt: parcel.endsAt
    }
  })
}

// -------------------------------------------------------------------------
// Email

function* handleEmailSubscribe(action) {
  const { email } = action
  const { address } = yield select(selectors.getAddressStateData)

  const payload = email
  const message = eth.utils.toHex(payload)

  try {
    const signature = yield call(() => eth.remoteSign(message, address))
    yield call(() => api.postSignedOutbidNotification(message, signature))

    yield put({ type: types.subscribeEmail.success, email })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.subscribeEmail.failed, error: error.message })
  }
}

function* handleEmailUnsubscribe(action) {
  const { address, email } = yield select(selectors.getAddressStateData)

  const payload = email
  const message = eth.utils.toHex(payload)

  try {
    const signature = yield call(() => eth.remoteSign(message, address))

    yield call(() => api.deleteSignedOutbidNotifications(message, signature))

    yield put({ type: types.unsubscribeEmail.success })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.unsubscribeEmail.failed, error: error.message })
  }
}

function* handleEmailRegisterBids(action) {
  const { address } = yield select(selectors.getAddressStateData)

  if (address) {
    yield call(() => api.postOutbidNotification(address))
  }
}

export default rootSaga
