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
    dispatch(actionType, actionSources.VIEW, actionArguments(arguments));
  }

  function dispatchServerAction(actionType) {
    dispatch(actionType, actionSources.SERVER, actionArguments(arguments));
  }

  function dispatchAction(actionType) {
    dispatch(actionType, null, actionArguments(arguments));
  }

  function actionArguments(args) {
    return _.rest(_.toArray(args));
  }

  function dispatch(actionType, source, args) {
    options.dispatcher.dispatch({
      source: source,
      arguments: args,
      type: actionType
    });
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;