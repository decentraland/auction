import { compose, createStore, combineReducers, applyMiddleware } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import reduxThunk from "redux-thunk";
import createHistory from "history/createBrowserHistory";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducers = {};

const history = createHistory();

// dispatch navigation actions from anywhere! like this: store.dispatch(push('/foo'))
const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  composeEnhancers(applyMiddleware(reduxThunk, middleware))
);

export { history, store };
