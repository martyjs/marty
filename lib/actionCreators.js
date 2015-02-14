var _ = require('underscore');
var log = require('./logger');
var uuid = require('./utils/uuid');
var RESERVED_KEYWORDS = ['dispatch'];
var Dispatcher = require('./dispatcher');
var ActionPayload = require('./actionPayload');
var ActionConstants = require('../constants/actions');
var serializeError = require('./utils/serializeError');

function ActionCreators(options) {
  options || (options = {});

  var creator = {
    __id: uuid.small(),
    __type: 'ActionCreator'
  };

  var dispatcher = options.dispatcher || Dispatcher.getDefault();

  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (options[keyword]) {
      throw new Error(keyword + ' is a reserved keyword');
    }
  });

  creator.getActionType = getActionType;

  _.extend.apply(_, [
    creator,
    wrapFunctions(_.clone(options))
  ].concat(options.mixins));

  return creator;

  function getActionType(name) {
    return name.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toUpperCase();
  }

  function wrapFunctions(functions) {
    _.each(functions, function (func, name) {
      var actionType;
      var properties = {};
      var dispatchedAction;

      if (_.isFunction(func)) {
        if (func.properties) {
          if (!func.properties.type) {
            throw new Error('Unknown action type');
          }

          actionType = func.properties.type;
          properties = _.omit(func.properties, 'type');
        } else if (options.types && options.types[name]) {
          actionType = options.types[name];
        } else {
          actionType = creator.getActionType(name);
        }
      } else {
        return;
      }

      functions[name] = function () {
        var result;
        var handlers = [];
        var actionId = uuid.small();

        dispatchStarting();

        try {
          var context = actionContext();
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
          var error = 'An error occured when creating a \'' + actionType + '\' action in ';
          error += (creator.displayName || creator.id || ' ') + '#' + name;
          log.error(error, e);

          dispatchFailed(e);

          throw e;
        }

        function actionContext() {
          return _.extend({
            dispatch: function () {
              dispatchedAction = dispatch({
                id: actionId,
                type: actionType,
                handlers: handlers,
                arguments: arguments
              }, properties);

              return dispatchedAction;
            }
          }, creator);
        }

        function dispatchStarting() {
          if (properties.silent) {
            return;
          }

          dispatch({
            internal: true,
            type: actionType + '_STARTING',
            arguments: [{
              id: actionId
            }]
          }, properties);

          dispatch({
            internal: true,
            type: ActionConstants.ACTION_STARTING,
            arguments: [{
              id: actionId,
              type: actionType,
              handlers: handlers,
              properties: properties
            }]
          }, properties);
        }

        function dispatchDone() {
          if (properties.silent) {
            return;
          }

          dispatch({
            internal: true,
            type: actionType + '_DONE',
            arguments: [{
              id: actionId,
              handlers: handlers
            }]
          }, properties);

          dispatch({
            internal: true,
            type: ActionConstants.ACTION_DONE,
            arguments: [{
              id: actionId,
              handlers: handlers
            }]
          }, properties);
        }

        function dispatchFailed(err) {
          err = serializeError(err);

          dispatch({
            internal: true,
            type: actionType + '_FAILED',
            arguments: [{
              error: err,
              id: actionId,
              handlers: handlers
            }]
          }, properties);

          dispatch({
            internal: true,
            type: ActionConstants.ACTION_FAILED,
            arguments: [{
              error: err,
              id: actionId,
              handlers: handlers
            }]
          }, properties);

          if (dispatchedAction) {
            dispatchedAction.rollback();
            dispatchedAction.error = err;
          }
        }
      };
    });

    return functions;
  }

  function dispatch(payload, properties) {
    var action = new ActionPayload(_.extend({}, properties, payload));
    dispatcher.dispatch(action);
    return action;
  }
}

module.exports = ActionCreators;
