import { delay } from "redux-saga";
import { call, takeLatest, select, takeEvery, put } from "redux-saga/effects";
import { push, replace } from "react-router-redux";

import { eth } from "decentraland-commons";

import locations from "./locations";
import types from "./types";
import { selectors } from "./reducers";
import { buildCoordinate } from "./lib/util";
import * as addressStateUtils from "./lib/addressStateUtils";
import * as parcelUtils from "./lib/parcelUtils";
import api from "./lib/api";

// TODO: We need to avoid having a infinite spinner when an error occurs and the user navigates back to the root location.
//       We can listen to URL changes and try to load web3 in that particular case
function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3);

  yield takeLatest(types.changeLocation, handleLocationChange);

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange);
  yield takeEvery(types.fetchParcels.request, handleParcelFetchRequest);

  yield takeLatest(types.connectWeb3.success, handleAddressFetchRequest);
  yield takeEvery(types.fetchManaBalance.request, handleAddressFetchRequest);

  yield takeEvery(types.fetchAddressState.request, handleAddressFetchRequest);

  yield takeEvery(types.fetchProjects.request, handleProjectsFetchRequest);

  yield takeEvery(
    types.fetchOngoingAuctions.request,
    handleOngoingAuctionsFetchRequest
  );

  yield takeLatest(types.confirmBids.request, handleAddresStateStartLoading);
  yield takeLatest(types.confirmBids.request, handleConfirmBidsRequest);
  yield takeLatest(types.confirmBids.success, handleAddressFetchRequest);
  yield takeLatest(types.confirmBids.failed, handleAddresStateFinishLoading);

  // Start
  yield call(connectWeb3);
}

// -------------------------------------------------------------------------
// Web3

function* connectWeb3(action = {}) {
  try {
    let retries = 0;
    let connected = eth.connect(action.address);

    while (!connected && retries <= 3) {
      yield delay(1500);
      connected = eth.connect(action.address);
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
// Location

function* handleLocationChange(action) {
  yield put(push(action.url));
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
// Projects

function* handleProjectsFetchRequest(action) {
  try {
    const projects = yield call(() => api.fetchProjects());

    yield put({ type: types.fetchProjects.success, projects });
  } catch (error) {
    yield put({ type: types.fetchProjects.failed, error: error.message });
  }
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
      parcel.amount = parseFloat(parcel.amount, 10) || null;
      parcel.endsAt = parcel.endsAt ? new Date(parcel.endsAt) : null;
    }

    yield put({ type: types.fetchParcels.success, parcelStates });
  } catch (error) {
    yield put({ type: types.fetchParcels.failed, error: error.message });
  }
}

function* handleParcelRangeChange(action) {
  const parcelStates = yield select(selectors.getParcelStates);
  const { minX, minY, maxX, maxY } = action;

  // For each parcel in screen, if it is not loaded, request to fetch it
  // For parcels already loaded, we don't care in here
  const parcelsToFetch = parcelUtils
    .generateMatrix(minX, minY, maxX, maxY)
    .filter(coordinate => !parcelStates[coordinate]);

  if (parcelsToFetch.length) {
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch });
  }
}

// -------------------------------------------------------------------------
// Bids

function* handleOngoingAuctionsFetchRequest(action) {
  try {
    let parcelStates = yield select(selectors.getParcelStates);
    let addressState = yield select(selectors.getAddressStateData);

    const address = addressState.address;
    const ongoingAuctions = [];

    const bidCoordinates = addressStateUtils.getBidCoordinates(addressState);

    if (bidCoordinates.length) {
      yield call(() => handleParcelFetchRequest({ parcels: bidCoordinates }));
      parcelStates = yield select(selectors.getParcelStates);
    }

    for (const coordinate of bidCoordinates) {
      const parcel = parcelStates[coordinate];
      const status = parcelUtils.getBidStatus(parcel, address);

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
