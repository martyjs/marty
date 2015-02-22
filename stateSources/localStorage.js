var noopStorage = require('./noopStorage');
var StateSource = require('../stateSource');

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

  static get defaultNamespace() {
    return '';
  }
}

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || LocalStorageStateSource.defaultNamespace;
}

module.exports = LocalStorageStateSource;