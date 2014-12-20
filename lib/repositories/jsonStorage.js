
function JsonStorageRepository(options) {

  var defaultPrefix = '';

  var mixin  = {
    get: function (key) {
      var raw = localStorage.getItem(getPrefixedKey(key));
      try {
        var payload = JSON.parse(raw);
        return payload.value;
      } catch (e) {
        throw new Error('Unable to parse JSON from storage');
      }
    },
    set: function (key, value) {
      //Wrap the value in an object so as to preserve it's type
      //during serialization.
      var payload = {
        value: value
      };
      var raw = JSON.stringify(payload);
      localStorage.setItem(getPrefixedKey(key), raw);
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

module.exports = JsonStorageRepository;