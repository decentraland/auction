import { delay } from "redux-saga";
import { call, takeLatest, takeEvery, put } from "redux-saga/effects";
import { eth } from "decentraland-commons";

import types from "./types";
import * as actions from "./actions";
// import api from "./lib/api";

function* rootSaga() {
  yield takeLatest(types.connectWeb3, connectWeb3);
  yield takeEvery(types.fetchParcelStateRange, handleParcelRangeFetched);
}

// -------------------------------------------------------------------------
// Web3

function* connectWeb3(action) {
  let retries = 0;
  let connected = yield call(async () => await eth.connect(action.address));

  while (!connected && retries < 3) {
    yield delay(1000);
    connected = yield call(async () => await eth.connect(action.address));
    retries += 1;
  }

  if (!connected) throw new Error("Could not connect to web3");
}

// -------------------------------------------------------------------------
// Parcel States

function* handleParcelRangeFetched(action) {
  // const { mincoords, maxcoords } = action;
  // const parcelStates = yield call(() =>
  //   api.fetchParcelStateRange(mincoords, maxcoords)
  // );
  const parcelStates = [{ x: 2, y: 3 }];

  yield put(actions.setParcelStates(parcelStates));
}

export default rootSaga;
