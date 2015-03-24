let noopStorage = require('./noopStorage');
let StateSource = require('../stateSource');

class JSONStorageStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isJSONStorageStateSource = true;

    if (!this.storage) {
      this.storage = JSONStorageStateSource.defaultStorage;
    }
  }

  get(key) {
    let raw = getStorage(this).getItem(getNamespacedKey(this, key));

    if (!raw) {
      return raw;
    }

    try {
      let payload = JSON.parse(raw);
      return payload.value;
    } catch (e) {
      throw new Error('Unable to parse JSON from storage');
    }
  }

  set(key, value) {
    // Wrap the value in an object so as to preserve it's type
    // during serialization.
    let payload = {
      value: value
    };
    let raw = JSON.stringify(payload);
    getStorage(this).setItem(getNamespacedKey(this, key), raw);
  }

  static get defaultNamespace() {
    return '';
  }

  static get defaultStorage() {
    return typeof window === 'undefined' ? noopStorage : window.localStorage;
  }
}

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || JSONStorageStateSource.defaultNamespace;
}

function getStorage(source) {
  return source.storage || JSONStorageStateSource.defaultStorage || noopStorage;
}

module.exports = JSONStorageStateSource;