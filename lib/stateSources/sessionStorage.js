var noopStorage = require('./noopStorage');

function SessionStorageStateSource(options) {
  options = options || {};

  var defaultNamespace = '';
  var storage = sessionStorage || noopStorage;

  var mixin  = {
    _isSessionStorageStateSource: true,
    get: function (key) {
      return storage.getItem(getNamespacedKey(key));
    },
    set: function (key, value) {
      storage.setItem(getNamespacedKey(key), value);
    }
  };

  return mixin;

  function getNamespacedKey(key) {
    return getNamespace() + key;
  }

  function getNamespace() {
    return options.namespace || defaultNamespace;
  }
}

module.exports = SessionStorageStateSource;