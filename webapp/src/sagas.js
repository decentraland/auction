import { call, takeEvery, put } from "redux-saga/effects";
// import { push } from "react-router-redux";

// import locations from "./locations";
import types from "./types";
import actions from "./actions";
import api from "./lib/api";

function* rootSaga() {
  yield takeEvery(types.fetchParcelStateRange, handleParcelRangeFetched);
}

function* handleParcelRangeFetched(action) {
  const { mincoords, maxcoords } = action;
  const parcelStates = yield call(() =>
    api.fetchParcelStateRange(mincoords, maxcoords)
  );

  yield put(actions.setParcelState(parcelStates));
}

export default rootSaga;
