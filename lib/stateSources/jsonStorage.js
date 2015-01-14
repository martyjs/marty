function JSONStorageStateSource(options) {
  options = options || {};

  var defaultNamespace = '';
  var defaultStorage = localStorage;

  var mixin  = {
    get: function (key) {
      var raw = getStorage().getItem(getNamespacedKey(key));
      try {
        var payload = JSON.parse(raw);
        return payload.value;
      } catch (e) {
        throw new Error('Unable to parse JSON from storage');
      }
    },
    set: function (key, value) {
      // Wrap the value in an object so as to preserve it's type
      // during serialization.
      var payload = {
        value: value
      };
      var raw = JSON.stringify(payload);
      getStorage().setItem(getNamespacedKey(key), raw);
    }
  };

  return mixin;

  function getNamespacedKey(key) {
    return getNamespace() + key;
  }

  function getStorage() {
    return options.storage || defaultStorage;
  }

  function getNamespace() {
    return options.namespace || defaultNamespace;
  }
}

module.exports = JSONStorageStateSource;