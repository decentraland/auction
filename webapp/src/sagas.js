// import { call, takeEvery, put } from "redux-saga/effects";
import { takeEvery, put } from "redux-saga/effects";
// import { push } from "react-router-redux";

// import locations from "./locations";
import types from "./types";
import * as actions from "./actions";
// import api from "./lib/api";

function* rootSaga() {
  yield takeEvery(types.fetchParcelStateRange, handleParcelRangeFetched);
}

function* handleParcelRangeFetched(action) {
  // const { mincoords, maxcoords } = action;
  // const parcelStates = yield call(() =>
  //   api.fetchParcelStateRange(mincoords, maxcoords)
  // );
  const parcelStates = [{ x: 2, y: 3 }];

  yield put(actions.setParcelStates(parcelStates));
}

export default rootSaga;
