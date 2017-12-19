import { delay } from 'redux-saga'
import {
  all,
  call,
  takeLatest,
  select,
  takeEvery,
  put
} from 'redux-saga/effects'
import { push, replace } from 'react-router-redux'

import { env, utils } from 'decentraland-commons'
import { eth as web3Eth } from 'decentraland-commons'

import locations from './locations'
import types from './types'
import { selectors } from './reducers'

import { buildCoordinate, flashNotice } from './lib/util'
import * as addressStateUtils from './lib/addressStateUtils'
import * as parcelUtils from './lib/parcelUtils'
import * as pendingBidsUtils from './lib/pendingBidsUtils'
import api from './lib/api'

// TODO: We need to avoid having a infinite spinner when an error occurs and the user navigates back to the root location.
//       We can listen to URL changes and try to load web3 in that particular case
function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3)
  yield takeLatest(types.connectWeb3.success, handleAddressFetchRequest)

  yield takeEvery(types.navigateTo, handleLocationChange)

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange)

  yield takeLatest(types.fetchParcels.request, handleParcelFetchRequest)
  yield takeEvery(types.fetchParcels.failed, retryParcelFetch)

  yield takeLatest(types.fetchAddressState.request, handleAddressFetchRequest)

  yield takeEvery(types.fetchProjects.request, handleProjectsFetchRequest)

  yield takeEvery(types.appendUnconfirmedBid, handleAddressUpdateBalance)

  yield takeEvery(
    types.fetchOngoingAuctions.request,
    handleOngoingAuctionsFetchRequest
  )
  yield takeEvery(
    types.fetchAddressState.success,
    handleOngoingAuctionsFetchRequest
  )

  yield takeEvery(types.fastBid, handleFastBid)

  yield takeLatest(types.confirmBids.request, handleAddresStateStartLoading)
  yield takeLatest(types.confirmBids.request, handleConfirmBidsRequest)

  yield takeLatest(types.confirmBids.success, handleAddressFetchRequest)
  yield takeLatest(types.confirmBids.success, handleEmailRegisterBids)

  yield takeEvery(types.confirmBids.failed, handleOngoingAuctionsFetchRequest)
  yield takeLatest(types.confirmBids.failed, handleAddressFetchReload)
  yield takeLatest(types.confirmBids.failed, handleAddresStateFinishLoading)

  yield takeLatest(types.subscribeEmail.request, handleEmailSubscribe)
  yield takeLatest(types.unsubscribeEmail.request, handleEmailUnsubscribe)

  yield takeLatest(types.subscribeEmail.success, handleAddressFetchReload)

  yield put({ type: types.connectWeb3.request })
}

// -------------------------------------------------------------------------
// Web3

async function connectLedger(action = {}) {
  try {
    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      return false
    }
    const ledger = window.ledger
    const comm = await ledger.comm_u2f.create_async(5)
    const ledgerEth = new ledger.eth(comm)
    const address = await ledgerEth.getAddress_async(`44'/60'/0'/0`)
    return {
      ethereum: ledgerEth,
      ledger: true,
      address: address.address.toLowerCase()
    }
  } catch (error) {
    return false
  }
}

async function connectBrowser(action = {}) {
  try {
    let retries = 0
    let connected = await web3Eth.reconnect(action.address)

    while (!connected && retries <= 3) {
      await utils.sleep(1500)
      connected = await web3Eth.connect(action.address)
      retries += 1
    }

    if (!connected) return false
    const address = await web3Eth.getAddress()

    return {
      ethereum: web3Eth,
      address: address.toLowerCase()
    }
  } catch (error) {
    return false
  }
}

function* connectWeb3(action = {}) {
  try {
    const { ledger, browser } = yield all({
      ledger: call(connectLedger),
      browser: call(connectBrowser)
    })

    if (!ledger && !browser) throw new Error('Could not connect to web3')

    const address = ledger ? ledger.address : browser.address
    const ethereum = ledger ? ledger.ethereum : browser.ethereum

    yield put({
      type: types.connectWeb3.success,
      ledger: !!ledger,
      ethereum,
      web3Connected: true,
      address: address
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
  const ethereum = yield select(selectors.getEthereumConnection)

  const addressState = yield call(() =>
    api.fetchFullAddressState(ethereum.address)
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
  } else {
    yield put({ type: types.setLoading, loading: false })
  }
}

// -------------------------------------------------------------------------
// Bids

function* handleOngoingAuctionsFetchRequest(action) {
  try {
    let parcelStates = yield select(selectors.getParcelStates)
    let addressState = yield select(selectors.getAddressStateData)
    let ongoingAuctions = yield select(selectors.getOngoingAuctionsData)

    const bidCoordinates = addressStateUtils.getBidCoordinates(addressState)

    if (ongoingAuctions && ongoingAuctions.length === bidCoordinates.length) {
      // Return early
      yield put({ type: types.fetchOngoingAuctions.success, ongoingAuctions })
      return
    }

    if (bidCoordinates.length) {
      yield call(() => handleParcelFetchRequest({ parcels: bidCoordinates }))
      parcelStates = yield select(selectors.getParcelStates)
    }

    const newAuctions = bidCoordinates.map(coordinate => {
      const parcel = parcelStates[coordinate]
      const status = parcelUtils.getBidStatus(parcel, addressState)

      return {
        status,
        address: addressState.address,
        x: parcel.x,
        y: parcel.y,
        amount: parcel.amount,
        endsAt: parcel.endsAt
      }
    })

    yield put({
      type: types.fetchOngoingAuctions.success,
      ongoingAuctions: newAuctions
    })
  } catch (error) {
    console.warn(error)
    yield put({
      type: types.fetchOngoingAuctions.failed,
      error: error.message
    })
  }
}

// -------------------------------------------------------------------------
// Signing

async function sign(message, address, ethereum, ledger) {
  if (ledger) {
    try {
      const result = await ethereum.signPersonalMessage_async(
        "44'/60'/0'/0",
        message.substring(2)
      )

      let v = result['v'] - 27
      v = v.toString(16)
      if (v.length < 2) {
        v = '0' + v
      }
      return '0x' + result['r'] + result['s'] + v
    } catch (error) {
      console.log(error, error.stack)
    }
  } else {
    return await ethereum.remoteSign(message, address)
  }
}

function* handleConfirmBidsRequest(action) {
  const { address, bidGroups } = yield select(selectors.getAddressStateData)
  const { ethereum, ledger } = yield select(selectors.getEthereumConnection)
  const bids = action.bids
  const parcels = bids.map(bid => buildCoordinate(bid.x, bid.y))

  try {
    const payload = buildBidsSignPayload(bids)
    const message = web3Eth.utils.toHex(payload)
    const signature = yield call(() => sign(message, address, ethereum, ledger))

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
  const header = env.isDevelopment() ? 'MOCK AUCTION' : 'Decentraland Auction'

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
    yield call(() => flashNotice("You can't bid on a project parcel"))
    return
  }

  const { x, y } = parcel
  const amount = parcelUtils.minimumBid(parcel.amount)
  const addressState = yield select(selectors.getAddressState)

  if (addressState.loading) {
    return
  }
  if (amount > addressState.data.balance) {
    yield call(() =>
      flashNotice(`You don't have enough balance to bid on ${x}, ${y}`)
    )
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
  const { ethereum, ledger } = yield select(selectors.getEthereumConnection)

  const timestamp = new Date().getTime()
  const payload = `Decentraland Auction: Subscribe ${email} (${timestamp})`
  const message = web3Eth.utils.toHex(payload)

  try {
    const signature = yield call(() => sign(message, address, ethereum, ledger))
    yield call(() => api.postSignedOutbidNotification(message, signature))

    yield put({ type: types.subscribeEmail.success })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.subscribeEmail.failed, error: error.message })
  }
}

function* handleEmailUnsubscribe(action) {
  const { address } = yield select(selectors.getAddressStateData)
  const { ethereum, ledger } = yield select(selectors.getEthereumConnection)

  const timestamp = new Date().getTime()
  const payload = `Decentraland Auction: Unsubscribe Emails (${timestamp})`
  const message = web3Eth.utils.toHex(payload)

  try {
    const signature = yield call(() => sign(message, address, ethereum, ledger))

    yield call(() => api.deleteSignedOutbidNotifications(message, signature))

    yield put({ type: types.unsubscribeEmail.success })
  } catch (error) {
    console.warn(error)
    yield put({ type: types.unsubscribeEmail.failed, error: error.message })
  }
}

function* handleEmailRegisterBids(action) {
  const { address, email } = yield select(selectors.getAddressStateData)

  if (address && email) {
    yield call(() => api.postOutbidNotification(address))
  }
}

export default rootSaga
