
function LocalStorageRepository(options) {

  var defaultPrefix = '';

  var mixin  = {
    get: function (key) {
      return localStorage.getItem(getPrefixedKey(key));
    },
    set: function (key, value) {
      localStorage.setItem(getPrefixedKey(key), value);
    }
  };

  return mixin;

  function getPrefixedKey(key) {
    return getPrefix() + key;
  }

  function getPrefix() {
    return options.prefix || defaultPrefix;
  }

}

module.exports = LocalStorageRepository;