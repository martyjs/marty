var Action = require('./action');
var _ = require('./utils/tinydash');
var actionSources = require('./internalConstants').actionSources;

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, options);

  this.dispatch = dispatchAction;
  this.dispatchViewAction = dispatchViewAction;
  this.dispatchServerAction = dispatchServerAction;

  this.initialize.apply(this, arguments);

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
    return _.rest(_.toArray(args));
  }

  function dispatch(actionType, args, source) {
    var action = new Action(actionType, args, source);

    options.dispatcher.dispatch(action);

    return action;
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;