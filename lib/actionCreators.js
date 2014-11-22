var Action = require('./action');
var _ = require('./utils/tinydash');
var diagnostics = require('./diagnostics');
var actionSources = require('./internalConstants').actionSources;

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(this, options));

  this.dispatch = dispatchAction;
  this.dispatchViewAction = dispatchViewAction;
  this.dispatchServerAction = dispatchServerAction;

  function functions(actionCreator, options) {
    if (diagnostics.enabled) {
      return traceFunctions(actionCreator, options, 'ActionCreator');
    }

    return options;
  }

  function traceFunctions(actionCreator, functions) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var context = this;
        var creator = context.__creator || {
          action: name,
          type: 'ActionCreator',
          name: actionCreator.name,
          arguments: _.toArray(arguments)
        };

        if (!context.__creator) {
          context = _.extend({
            '__creator': creator
          }, actionCreator);
        }

        return func.apply(context, arguments);
      };
    });

    return functions;
  }

  function dispatchViewAction(actionType) {
    return dispatch({
      arguments: arguments,
      actionType: actionType,
      creator: this.__creator,
      source: actionSources.VIEW
    });
  }

  function dispatchServerAction(actionType) {
    return dispatch({
      arguments: arguments,
      actionType: actionType,
      creator: this.__creator,
      source: actionSources.SERVER
    });
  }

  function dispatchAction(actionType) {
    return dispatch({
      arguments: arguments,
      actionType: actionType,
      creator: this.__creator
    });
  }


  function dispatch(prop) {
    var action = new Action(
      prop.actionType,
      actionArguments(prop.arguments),
      prop.source,
      prop.creator
    );

    diagnostics.dispatchingAction(action);
    options.dispatcher.dispatch(action);

    return action;
  }

  function actionArguments(args) {
    args = _.toArray(args);
    args.shift();
    return args;
  }
}

module.exports = ActionCreators;