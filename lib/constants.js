var _ = require('lodash');

function constants(obj) {
  if (_.isArray(obj)) {
    return arrayToConstants(obj);
  }

  if (_.isObject(obj)) {
    return objectToConstants(obj);
  }

  function objectToConstants(obj) {
    return _.chain(obj).map(valueToArray).object().value();

    function valueToArray(value, key) {
      return [key, arrayToConstants(value)];
    }
  }

  function arrayToConstants(array) {
    return _.chain(array).map(pair).object().value();

    function pair(key) {
      return [key, key];
    }
  }
}

module.exports = constants;