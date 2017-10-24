import types from "./types";

function filterAction(name, handler) {
  return (store, action) => {
    if (action.type === name) {
      return handler(store, action);
    }
    return store;
  };
}

function pick(field) {
  return (store, action) => action[field];
}

export default function reducers() {
  return {
    parcelStates: filterAction(types.setParcelStates, pick("parcelStates"))
  };
}
