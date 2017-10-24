import { compose, createStore, combineReducers, applyMiddleware } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import reduxThunk from "redux-thunk";
import createSagasMiddleware from "redux-saga";
import createHistory from "history/createBrowserHistory";

import reducers from "./reducers";
import rootSaga from "./sagas";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// dispatch navigation actions from anywhere! like this: store.dispatch(push(locations.root))
const history = createHistory();
const historyMiddleware = routerMiddleware(history);
const sagasMiddleware = createSagasMiddleware();

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  composeEnhancers(
    applyMiddleware(reduxThunk, sagasMiddleware, historyMiddleware)
  )
);

sagasMiddleware.run(rootSaga);

export function dispatch(action) {
  if (typeof action === "string") {
    store.dispatch({ type: action });
  } else {
    store.dispatch(action);
  }
}

export function getState() {
  return store.getState();
}

export { history, store };
