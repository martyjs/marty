module.exports = {
  StateSource: require('./stateSource'),
  HttpStateSource: require('./stateSource/inbuilt/http'),
  CookieStateSource: require('./stateSource/inbuilt/cookie'),
  LocationStateSource: require('./stateSource/inbuilt/location'),
  JSONStorageStateSource: require('./stateSource/inbuilt/jsonStorage'),
  LocalStorageStateSource: require('./stateSource/inbuilt/localStorage'),
  SessionStorageStateSource: require('./stateSource/inbuilt/sessionStorage'),
};