var _ = require('underscore');
var uuid = require('./utils/uuid');
var RESERVED_KEYWORDS = ['dispatch'];
var Dispatcher = require('./dispatcher');
var ActionPayload = require('./actionPayload');
var ActionConstants = require('../constants/actions');
var serializeError = require('./utils/serializeError');


function ActionCreators(options) {
  var creator = this;
  var dispatcher = options.dispatcher || Dispatcher.getCurrent();

  options || (options = {});

  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (options[keyword]) {
      throw new Error(keyword + ' is a reserved keyword');
    }
  });


  this.getActionType = getActionType;

  _.extend.apply(_, [
    this,
    wrapFunctions(options)
  ].concat(options.mixins));

  function getActionType(name) {
    return name.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toUpperCase();
  }

  function wrapFunctions(functions) {
    _.each(functions, function (func, name) {
      var actionType;
      var properties = {};

      if (_.isFunction(func)) {
        if (func.properties) {
          if (!func.properties.type) {
            throw new Error('Unknown action type');
          }

          actionType = func.properties.type;
          properties = _.omit(func.properties, 'type');
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
          result = func.apply(context, Array.prototype.slice.call(arguments).concat(context.dispatch));

          if (result) {
            if (_.isFunction(result.then)) {
              result.then(dispatchDone, dispatchError);
            } else {
              dispatchDone();
            }
          } else {
            dispatchDone();
          }

          return result;
        } catch (e) {
          dispatchError(e);

          throw e;
        }

        function actionContext() {
          return _.extend({
            dispatch: function () {
              return dispatch({
                type: actionType,
                handlers: handlers,
                arguments: arguments
              }, properties);
            }
          }, creator);
        }

        function dispatchStarting() {
          dispatch({
            verbose: true,
            type: actionType + '_STARTING',
            arguments: [{
              id: actionId
            }]
          }, properties);

          dispatch({
            verbose: true,
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
          dispatch({
            verbose: true,
            type: actionType + '_DONE',
            arguments: [{
              id: actionId,
              handlers: handlers
            }]
          }, properties);

          dispatch({
            verbose: true,
            type: ActionConstants.ACTION_DONE,
            arguments: [{
              id: actionId,
              handlers: handlers
            }]
          }, properties);
        }

        function dispatchError(err) {
          err = serializeError(err);

          dispatch({
            verbose: true,
            type: actionType + '_FAILED',
            arguments: [{
              error: err,
              id: actionId,
              handlers: handlers
            }]
          }, properties);

          dispatch({
            verbose: true,
            type: ActionConstants.ACTION_FAILED,
            arguments: [{
              error: err,
              id: actionId,
              handlers: handlers
            }]
          }, properties);
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
