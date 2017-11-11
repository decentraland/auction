import { delay } from "redux-saga";
import {
  fork,
  call,
  takeLatest,
  select,
  takeEvery,
  put
} from "redux-saga/effects";

import { eth } from "decentraland-commons";

import types from "./types";
import { selectors } from "./reducers";
import api from "./lib/api";
import { buildCoordinate } from "./util";

function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3);

  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange);
  yield takeEvery(types.fetchParcels.request, handleParcelFetchRequest);

  yield takeEvery(
    types.fetchFullAddressState.request,
    handleFullAddressFetchRequest
  );

  yield takeLatest(types.connectWeb3.success, handleManaBalanceFetch);
  yield takeEvery(types.fetchManaBalance.request, handleManaBalanceFetch);

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

    yield put({ type: types.connectWeb3.success, web3Connected: true });
  } catch (error) {
    yield put({ type: types.connectWeb3.failed, message: error.message });
  }
}

// -------------------------------------------------------------------------
// Address States

function* handleFullAddressFetchRequest(action) {
  try {
    if (!eth.getAddress) {
      throw new Error(
        "Tried to fetch the full address state without an address. Connect to Ethereum first."
      );
    }

    const addressState = yield call(() =>
      api.fetchFullAddressState(eth.getAddress())
    );
    yield put({ type: types.fetchFullAddressState.success, addressState });
  } catch (error) {
    yield put({
      type: types.fetchFullAddressState.failed,
      error: error.message
    });
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

// -------------------------------------------------------------------------
// MANA balance

function* handleManaBalanceFetch(action) {
  try {
    const ethereum = yield select(selectors.getEthereum);

    if (!ethereum.success) {
      throw new Error(
        "Tried to get the MANA balance without connecting to ethereum first"
      );
    }

    const address = eth.getAddress();
    const manaBalance = yield call(() =>
      eth.getContract("MANAToken").getBalance(address)
    );

    yield put({ type: types.fetchManaBalance.success, manaBalance });
  } catch (error) {
    yield put({ type: types.fetchManaBalance.failed, error: error.message });
  }
}

export default rootSaga;
