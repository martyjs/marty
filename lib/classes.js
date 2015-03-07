module.exports = {
  Store: require('./store'),
  Queries: require('./queries'),
  Component: require('./component'),
  StateSource: require('./stateSource'),
  ActionCreators: require('./actionCreators'),
  HttpStateSource: require('./stateSource/inbuilt/http'),
  JSONStorageStateSource: require('./stateSource/inbuilt/jsonStorage'),
  LocalStorageStateSource: require('./stateSource/inbuilt/localStorage'),
  SessionStorageStateSource: require('./stateSource/inbuilt/sessionStorage'),
};