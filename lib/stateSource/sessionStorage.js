var StateSource = require('./stateSource');
var noopStorage = require('./noopStorage');

class SessionStorageStateSource extends StateSource {
  constructor() {
    this._isSessionStorageStateSource = true;
    this.storage = typeof window === 'undefined' ? noopStorage : window.sessionStorage;
  }

  get(key) {
    return this.storage.getItem(getNamespacedKey(this, key));
  }

  set(key, value) {
    return this.storage.setItem(getNamespacedKey(this, key), value);
  }
}

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || SessionStorageStateSource.defaultNamespace;
}

SessionStorageStateSource.defaultNamespace = '';

module.exports = SessionStorageStateSource;