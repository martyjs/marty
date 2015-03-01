var noopStorage = require('./noopStorage');
var StateSource = require('../stateSource');

class SessionStorageStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isSessionStorageStateSource = true;
    this.storage = typeof window === 'undefined' ? noopStorage : window.sessionStorage;
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
  return source.namespace || SessionStorageStateSource.defaultNamespace;
}

module.exports = SessionStorageStateSource;