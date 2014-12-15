var uuid = require('./utils/uuid');
var _ = require('./utils/tinydash');
var Dispatcher = require('./dispatcher');
var ActionPayload = require('./actionPayload');
var Actions = require('./internalConstants').Actions;

function ActionCreators(options) {
  var creator = this;
  var dispatcher = options.dispatcher || Dispatcher.getCurrent();

  options || (options = {});

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

      if (_.isFunction(func)) {
        actionType = creator.getActionType(name);
      } else if (_.isArray(func) && func.length === 2 && _.isFunction(func[1])) {
        actionType = func[0];
        func = func[1];
      } else {
        return;
      }

      functions[name] = function () {
        var result;
        var handlers = [];
        var token = uuid.small();

        dispatchStarting();

        try {
          result = func.apply(actionContext(), arguments);

          if (result) {
            if (result instanceof Error) {
              dispatchError(result);
            } else if (_.isFunction(result.then)) {
              result.then(dispatchDone, dispatchError);
            } else {
              dispatchDone();
            }
          } else {
            dispatchDone();
          }
        } catch (e) {
          dispatchError(e);
        }

        return token;

        function actionContext() {
          return _.extend({
            dispatch: function () {
              return dispatch({
                type: actionType,
                handlers: handlers,
                arguments: arguments
              });
            }
          }, this);
        }

        function dispatchStarting() {
          dispatch({
            type: actionType + '_STARTING',
            arguments: [{
              token: token
            }]
          });

          dispatch({
            type: Actions.ACTION_STARTING,
            arguments: [{
              token: token,
              type: actionType,
              handlers: handlers
            }]
          });
        }

        function dispatchDone() {
          dispatch({
            type: Actions.ACTION_DONE,
            arguments: [token]
          });
        }

        function dispatchError(err) {
          dispatch({
            type: actionType + '_FAILED',
            arguments: [{
              token: token,
              error: err
            }]
          });

          dispatch({
            type: Actions.ACTION_ERROR,
            arguments: [{
              token: token,
              error: err
            }]
          });
        }
      };
    });

    return functions;
  }

  function dispatch(payload) {
    var action = new ActionPayload(payload);
    dispatcher.dispatch(action);
    return action;
  }
}

module.exports = ActionCreators;