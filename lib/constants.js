var _ = require('underscore');

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

    function valueToArray(value, actionType) {
      return [actionType, toConstant(value)];
    }
  }

  function arrayToConstants(array) {
    return _.object(_.map(array, pair));

    function pair(actionType) {
      return [actionType, createActionCreator(actionType)];
    }
  }

  function createActionCreator(actionType) {
    var constantActionCreator = function (actionCreator, properties) {
      actionCreator.properties = _.extend({}, properties, {
        type: actionType
      });

      return actionCreator;
    };

    constantActionCreator.toString = function () {
      return actionType;
    };

    return constantActionCreator;
  }
}

module.exports = constants;