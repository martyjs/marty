var StateSource = require('./stateSource');
var noopStorage = require('./noopStorage');

class LocalStorageStateSource extends StateSource {
  constructor() {
    this._isLocalStorageStateSource = true;
    this.storage = typeof window === 'undefined' ? noopStorage : window.localStorage;
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
  return source.namespace || LocalStorageStateSource.defaultNamespace;
}

LocalStorageStateSource.defaultNamespace = '';

module.exports = LocalStorageStateSource;