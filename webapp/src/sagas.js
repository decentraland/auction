import { delay } from "redux-saga";
import { call, takeLatest, select, takeEvery, put } from "redux-saga/effects";
import { eth } from "decentraland-commons";

import types from "./types";
import { selectors } from "./reducers";
import api from "./lib/api";
import { buildCoordinate } from "./util";

function* rootSaga() {
  yield takeLatest(types.connectWeb3.request, connectWeb3);
  yield takeEvery(types.parcelRangeChanged, handleParcelRangeChange);
  yield takeEvery(types.fetchParcels.request, handleParcelFetchRequest);
}

// -------------------------------------------------------------------------
// Web3

function* connectWeb3(action) {
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
    console.error(error);
    yield put({ type: types.connectWeb3.failed, message: error.message });
  }
}

// -------------------------------------------------------------------------
// Parcel States

function* handleParcelFetchRequest (action) {
  try {
    const parcelStates = yield call(() =>
      api.fetchParcelStates(action.parcels)
    );
    console.log(parcelStates)
    yield put({ type: types.fetchParcels.success, parcelStates })
  } catch (e) {
    yield put({ ...action , type: types.fetchParcels.failed })
  }

}

function* handleParcelRangeChange(action) {

  // Retrieve the current state
  const currentState = yield select(selectors.getParcelStates)
  const { minX, maxX, minY, maxY } = action

  // For each parcel in screen, if it is not loaded, request to fetch it
  // For parcels already loaded, we don't care in here
  // (they are updated via push on websocket)
  const parcelsToFetch = []
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const coor = buildCoordinate(x, y)
      const current = currentState[coor]
      if (!current || (!current.data && !current.loading)) {
        parcelsToFetch.push(coor)
      }
    }
  }
  if (parcelsToFetch.length) {
    yield put({ type: types.fetchParcels.request, parcels: parcelsToFetch })
  }
}

export default rootSaga;
