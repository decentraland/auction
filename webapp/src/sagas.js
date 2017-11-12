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
    yield put({ type: types.connectWeb3.failed, message: error.message });
    yield put(replace(locations.walletError));
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
    yield put({
      type: types.fetchAddressState.failed,
      error: error.message
    });
    yield put(replace(locations.addressError));
  }
}

// -------------------------------------------------------------------------
// Parcel States

function* handleParcelFetchRequest(action) {
  try {
    const parcelStates = yield call(() =>
      api.fetchParcelStates(action.parcels)
    );
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
      const coor = buildCoordinate(x, y);
      const current = currentState[coor];
      if (!current || (!current.data && !current.loading)) {
        parcelsToFetch.push(coor);
      }
    }
  }

  if (parcelsToFetch.length) {
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch });
  }
}

export default rootSaga;
