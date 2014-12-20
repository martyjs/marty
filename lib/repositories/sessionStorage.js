
function SessionStorageRepository(options) {

  var defaultPrefix = '';

  var mixin  = {
    get: function (key) {
      return sessionStorage.getItem(getPrefixedKey(key));
    },
    set: function (key, value) {
      sessionStorage.setItem(getPrefixedKey(key), value);
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

module.exports = SessionStorageRepository;