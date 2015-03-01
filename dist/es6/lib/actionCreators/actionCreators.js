"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("underscore");
var log = require("../logger");
var uuid = require("../utils/uuid");
var warnings = require("../warnings");
var Instances = require("../instances");
var resolve = require("../utils/resolve");
var Environment = require("../environment");
var ActionPayload = require("../actionPayload");
var serializeError = require("../utils/serializeError");
var ActionConstants = require("../../constants/actions");
var FUNCTIONS_TO_NOT_WRAP = ["constructor"];

var ActionCreators = (function () {
  function ActionCreators(options) {
    var _this = this;

    _classCallCheck(this, ActionCreators);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn("Warning: Options were not passed into an action creators' constructor");
    }

    this.__type = "ActionCreators";
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);

    var props = _.difference(Object.getOwnPropertyNames(this.constructor.prototype), FUNCTIONS_TO_NOT_WRAP);

    if (options && options.types) {
      this.types = options.types;
    }

    // Wrap all functions so that we can emit actions before and after
    _.each(props, function (name) {
      var func = _this[name];

      if (_.isFunction(func)) {
        _this[name] = wrapFunction(_this, _this[name], name);
      }
    });
  }

  _prototypeProperties(ActionCreators, null, {
    types: {
      get: function () {
        return Instances.get(this).types;
      },
      set: function (value) {
        var _this = this;

        Instances.get(this).types = value;

        _.each(this.types, function (type, name) {
          if (_.isUndefined(_this[name])) {
            _this[name] = wrapFunction(_this, function () {
              this.dispatch.apply(this, arguments);
            }, name, type.toString());
          }
        });
      },
      configurable: true
    },
    getActionType: {
      value: function getActionType(name) {
        return name.replace(/([a-z\d])([A-Z]+)/g, "$1_$2").replace(/[-\s]+/g, "_").toUpperCase();
      },
      writable: true,
      configurable: true
    },
    "for": {
      value: function _for(obj) {
        return resolve(this, obj);
      },
      writable: true,
      configurable: true
    },
    context: {
      get: function () {
        return getInstance(this).context;
      },
      configurable: true
    }
  });

  return ActionCreators;
})();

module.exports = ActionCreators;

function wrapFunction(creators, func, name, actionType) {
  return function () {
    var result;
    var handlers = [];
    var dispatchedAction;
    var actionId = uuid.small();
    var context = actionContext();
    var functionMetadata = metadata(func, name);
    var annotations = functionMetadata.annotations || {};

    if (!actionType) {
      actionType = functionMetadata.actionType;
    }

    dispatchStarting();

    try {

      result = func.apply(context, arguments);

      if (result) {
        if (_.isFunction(result.then)) {
          result.then(dispatchDone, dispatchFailed);
        } else {
          dispatchDone();
        }
      } else {
        dispatchDone();
      }

      return result;
    } catch (e) {
      logError(e);
      dispatchFailed(e);

      throw e;
    }

    function actionContext() {
      return _.extend({
        dispatch: (function (_dispatch) {
          var _dispatchWrapper = function dispatch() {
            return _dispatch.apply(this, arguments);
          };

          _dispatchWrapper.toString = function () {
            return _dispatch.toString();
          };

          return _dispatchWrapper;
        })(function () {
          dispatchedAction = dispatch({
            id: actionId,
            type: actionType,
            handlers: handlers,
            arguments: arguments
          }, annotations);

          return dispatchedAction;
        })
      }, creators);
    }

    function dispatchStarting() {
      if (annotations.silent) {
        return;
      }

      dispatch({
        internal: true,
        type: "" + actionType + "_STARTING",
        arguments: [{
          id: actionId
        }]
      }, annotations);

      dispatch({
        internal: true,
        type: ActionConstants.ACTION_STARTING,
        arguments: [{
          id: actionId,
          type: actionType,
          handlers: handlers,
          annotations: annotations
        }]
      }, annotations);
    }

    function dispatchDone() {
      if (annotations.silent) {
        return;
      }

      dispatch({
        internal: true,
        type: "" + actionType + "_DONE",
        arguments: [{
          id: actionId,
          handlers: handlers
        }]
      }, annotations);

      dispatch({
        internal: true,
        type: ActionConstants.ACTION_DONE,
        arguments: [{
          id: actionId,
          handlers: handlers
        }]
      }, annotations);
    }

    function dispatchFailed(err) {

      err = serializeError(err);

      dispatch({
        internal: true,
        type: "" + actionType + "_FAILED",
        arguments: [{
          error: err,
          id: actionId,
          handlers: handlers
        }]
      }, annotations);

      dispatch({
        internal: true,
        type: ActionConstants.ACTION_FAILED,
        arguments: [{
          error: err,
          id: actionId,
          handlers: handlers
        }]
      }, annotations);

      if (dispatchedAction) {
        dispatchedAction.rollback();
        dispatchedAction.error = err;
      }
    }

    function metadata(func, name) {
      var actionType;
      var annotations = {};

      if (func.annotations) {
        if (!func.annotations.type) {
          throw new Error("Unknown action type");
        }

        actionType = func.annotations.type;
        annotations = _.omit(func.annotations, "type");
      } else if (creators.types && creators.types[name]) {
        actionType = creators.types[name];
      } else {
        actionType = creators.getActionType(name);
      }

      return {
        annotations: annotations,
        actionType: actionType.toString()
      };
    }

    function dispatch(payload, annotations) {
      var dispatcher = getInstance(creators).dispatcher;
      var action = new ActionPayload(_.extend({}, annotations, payload));

      dispatcher.dispatch(action);

      return action;
    }

    function logError(err) {
      var error = "An error occured when dispatching a '" + actionType + "' action in ";
      error += "" + (creators.displayName || creators.id || " ") + "#" + name;
      log.error(error, err);
    }
  };
}

function getInstance(creators) {
  return Instances.get(creators);
}

module.exports = ActionCreators;