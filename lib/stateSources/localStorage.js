var noopStorage = require('./noopStorage');

function LocalStorageStateSource(options) {
  options = options || {};

  var defaultNamespace = '';
  var storage = localStorage || noopStorage;

  var mixin  = {
    _isLocalStorageStateSource: true,
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

module.exports = LocalStorageStateSource;