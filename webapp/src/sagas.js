import { delay } from "redux-saga";
import {
  fork,
  call,
  takeLatest,
  select,
  takeEvery,
  put
} from "redux-saga/effects";
import { replace } from "react-router-redux";

import { eth } from "decentraland-commons";

import locations from "./locations";
import types from "./types";
import { selectors } from "./reducers";
import { buildCoordinate } from "./lib/util";
import api from "./lib/api";

function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3);

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange);
  yield takeEvery(types.fetchParcels.request, handleParcelFetchRequest);

  yield takeLatest(types.connectWeb3.success, handleAddressFetchRequest);
  yield takeEvery(types.fetchManaBalance.request, handleAddressFetchRequest);

  yield takeEvery(types.fetchAddressState.request, handleAddressFetchRequest);

  yield takeEvery(
    types.fetchOngoingAuctions.request,
    handleOngoingAuctionsFetchRequest
  );

  yield takeLatest(types.confirmBids.request, handleAddresStateStartLoading);
  yield takeLatest(types.confirmBids.request, handleConfirmBidsRequest);
  yield takeLatest(types.confirmBids.success, handleAddressFetchRequest);
  yield takeLatest(types.confirmBids.failed, handleAddresStateFinishLoading);

  // Start
  yield fork(connectWeb3);
}

// -------------------------------------------------------------------------
// Web3

function* connectWeb3(action = {}) {
  try {
    let retries = 0;
    let connected = yield call(async () => await eth.connect(action.address));

    while (!connected && retries < 3) {
      yield delay(1000);
      connected = yield call(async () => await eth.connect(action.address));
      retries += 1;
    }

    if (!connected) throw new Error("Could not connect to web3");

    yield put({
      type: types.connectWeb3.success,
      web3Connected: true,
      address: eth.getAddress()
    });
  } catch (error) {
    yield put(replace(locations.walletError));
    yield put({ type: types.connectWeb3.failed, message: error.message });
  }
}

// -------------------------------------------------------------------------
// Address States

function* handleAddressFetchRequest(action) {
  try {
    const web3Connected = yield select(selectors.getWeb3Connected);

    if (!web3Connected) {
      throw new Error(
        "Tried to get the MANA balance without connecting to ethereum first"
      );
    }

    const addressState = yield call(() =>
      api.fetchFullAddressState(eth.getAddress())
    );

    yield put({ type: types.fetchAddressState.success, addressState });
  } catch (error) {
    yield put(replace(locations.addressError));
    yield put({
      type: types.fetchAddressState.failed,
      error: error.message
    });
  }
}

function* handleAddresStateStartLoading(action) {
  yield put({ type: types.addressStateLoading, loading: true });
}

function* handleAddresStateFinishLoading(action) {
  yield put({ type: types.addressStateLoading, loading: false });
}

// -------------------------------------------------------------------------
// Parcel States

function* handleParcelFetchRequest(action) {
  try {
    const parcelStates = yield call(() =>
      api.fetchParcelStates(action.parcels)
    );

    for (let coordinate in parcelStates) {
      const parcel = parcelStates[coordinate];
      parcel.endsAt = new Date(parcel.endsAt);
    }

    yield put({ type: types.fetchParcels.success, parcelStates });
  } catch (error) {
    yield put({ type: types.fetchParcels.failed, error: error.message });
  }
}

function* handleParcelRangeChange(action) {
  // Retrieve the current state
  const currentState = yield select(selectors.getParcelStates);
  const { minX, maxX, minY, maxY } = action;

  // For each parcel in screen, if it is not loaded, request to fetch it
  // For parcels already loaded, we don't care in here
  // (they are updated via push on websocket)
  const parcelsToFetch = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const coordinate = buildCoordinate(x, y);
      const current = currentState[coordinate];
      if (!current || (!current.data && !current.loading)) {
        parcelsToFetch.push(coordinate);
      }
    }
  }

  if (parcelsToFetch.length) {
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch });
  }
}

// -------------------------------------------------------------------------
// Bids

function* handleOngoingAuctionsFetchRequest(action) {
  try {
    const addressState = yield select(selectors.getAddressState);
    let parcelStates = yield select(selectors.getParcelStates);

    const { address, bidGroups } = addressState.data;

    const ongoingAuctions = [];
    const biddedCoordinates = getBiddedCoordinates(bidGroups);

    if (biddedCoordinates.length) {
      yield call(() =>
        handleParcelFetchRequest({ parcels: biddedCoordinates })
      );
      parcelStates = yield select(selectors.getParcelStates);
    }

    for (const coordinate of biddedCoordinates) {
      const parcel = parcelStates[coordinate];
      const status = getParcelBidStatus(parcel, address);

      ongoingAuctions.push({
        address,
        status,
        x: parcel.x,
        y: parcel.y,
        amount: parcel.amount,
        endsAt: parcel.endsAt
      });
    }

    yield put({ type: types.fetchOngoingAuctions.success, ongoingAuctions });
  } catch (error) {
    yield put({
      type: types.fetchOngoingAuctions.failed,
      error: error.message
    });
  }
}

function getBiddedCoordinates(bidGroups) {
  const biddedCoordinates = new Set(); // test with set

  for (const bidGroup of bidGroups) {
    for (const bid of bidGroup.bids) {
      const coordinate = buildCoordinate(bid.x, bid.y);
      biddedCoordinates.add(coordinate);
    }
  }
  return [...biddedCoordinates];
}

function getParcelBidStatus(parcel, address) {
  const finished = Date.now() >= parcel.endsAt.getTime();
  const byAddress = parcel.address === address;

  let status = "";
  if (finished) {
    status = byAddress ? "Won" : "Lost";
  } else {
    status = byAddress ? "Wining" : "Outbid";
  }
  return status;
}

function* handleConfirmBidsRequest(action) {
  const addressState = yield select(selectors.getAddressState);
  const { address, bidGroups } = addressState.data;
  const bids = action.bids;

  try {
    const payload = buildBidsSignPayload(bids);
    const message = eth.utils.toHex(payload);
    const signature = yield call(() => eth.remoteSign(message, address));
    const nonce = getBidGroupsNonce(bidGroups);

    const bidGroup = { address, bids, message, signature, nonce };
    yield call(() => api.postBidGroup(bidGroup));

    const parcelsToFetch = bids.map(bid => buildCoordinate(bid.x, bid.y));

    yield put({ type: types.confirmBids.success });
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch });
  } catch (error) {
    // TODO: Manage API errors
    yield put({ type: types.confirmBids.failed, error: error.message });
  }
}

function buildBidsSignPayload(bids) {
  const payloadBids = bids
    .map(bid => `- (${buildCoordinate(bid.x, bid.y)}) for ${bid.amount} MANA`)
    .join("\n");

  return `Bids (${bids.length}):
  ${payloadBids}
Time: ${new Date().getTime()}`;
}

function getBidGroupsNonce(bidGroups) {
  const nonces = bidGroups.map(bidGroup => bidGroup.nonce).sort(); // DESC
  return nonces.length > 0 ? nonces.pop() + 1 : 0;
}

export default rootSaga;
