var _ = require('./utils/tinydash');

function constants(obj) {
  return toConstant(obj);

  function toConstant(obj) {
    if (!obj) {
      return {};
    }

    if (_.isArray(obj)) {
      return arrayToConstants(obj);
    }

    if (_.isObject(obj)) {
      return objectToConstants(obj);
    }
  }

  function objectToConstants(obj) {
    return _.object(_.map(obj, valueToArray));

    function valueToArray(value, key) {
      return [key, toConstant(value)];
    }
  }

  function arrayToConstants(array) {
    return _.object(_.map(array, pair));

    function pair(key) {
      return [key, key];
    }
  }
}

module.exports = constants;