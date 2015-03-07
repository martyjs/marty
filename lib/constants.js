var _ = require('./utils/mindash');
var log = require('./logger');
var warnings = require('./warnings');

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
    var constantActionCreator = function (actionCreator, annotations) {
      if (warnings.invokeConstant) {
        log.warn(
          'Warning: Invoking constants has been depreciated. ' +
          'Please migrate to using the types hash: ' +
          'http://martyjs.org/api/action-creators/index.html#types'
        );
      }

      if (!actionCreator) {
        actionCreator = dispatchActionCreator;
      } else if (!_.isFunction(actionCreator)) {
        annotations = actionCreator;
        actionCreator = dispatchActionCreator;
      }

      actionCreator.annotations = _.extend({}, annotations, {
        type: actionType
      });

      return actionCreator;

      function dispatchActionCreator() {
        this.dispatch.apply(this, arguments);
      }
    };

    constantActionCreator.type = actionType;
    constantActionCreator.isActionCreator = true;
    constantActionCreator.toString = function () {
      return actionType;
    };

    return constantActionCreator;
  }
}

module.exports = constants;