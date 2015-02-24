module.exports = {
  Store: require('./store'),
  Component: require('./component'),
  StateSource: require('./stateSource'),
  ActionCreators: require('./actionCreators'),
  HttpStateSource: require('../stateSources/http'),
  JSONStorageStateSource: require('../stateSources/jsonStorage'),
  LocalStorageStateSource: require('../stateSources/localStorage'),
  SessionStorageStateSource: require('../stateSources/sessionStorage'),
};