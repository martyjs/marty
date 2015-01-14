function SessionStorageStateSource(options) {

  options = options || {};
  var defaultNamespace = '';

  var mixin  = {
    get: function (key) {
      return sessionStorage.getItem(getNamespacedKey(key));
    },
    set: function (key, value) {
      sessionStorage.setItem(getNamespacedKey(key), value);
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