var Action = require('./action');
var _ = require('./utils/tinydash');
var Diagnostics = require('./diagnostics');
var actionSources = require('./internalConstants').actionSources;

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(this, options));

  this.dispatch = dispatchAction;
  this.dispatchViewAction = dispatchViewAction;
  this.dispatchServerAction = dispatchServerAction;

  function functions(actionCreator, options) {
    if (shouldTrace()) {
      return traceFunctions(actionCreator, options, 'ActionCreator');
    }

    return options;
  }

  function shouldTrace() {
    return options.trace || _.isUndefined(options.trace);
  }

  function traceFunctions(actionCreator, functions) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var context = this;
        var dataFlow = context.__dataFlow || Diagnostics.createDataFlow({
          instigator: {
            name: actionCreator.name,
            type: 'ActionCreator',
            action: name,
            arguments: arguments
          }
        });

        if (!context.__dataFlow) {
          context = _.extend({
            '__dataFlow': dataFlow
          }, actionCreator);
        }

        return func.apply(context, arguments);
      };
    });

    return functions;
  }

  function dispatchViewAction(actionType) {
    return dispatch(actionType, actionArguments(arguments), actionSources.VIEW);
  }

  function dispatchServerAction(actionType) {
    return dispatch(actionType, actionArguments(arguments), actionSources.SERVER);
  }

  function dispatchAction(actionType) {
    return dispatch(actionType, actionArguments(arguments));
  }

  function actionArguments(args) {
    args = _.toArray(args);
    args.shift();
    return args;
  }

  function dispatch(actionType, args, source) {
    var action = new Action(actionType, args, source, this.__dataFlow);

    options.dispatcher.dispatch(action);

    return action;
  }
}

module.exports = ActionCreators;