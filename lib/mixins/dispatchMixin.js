var Action = require('../action');
var _ = require('../utils/tinydash');
var diagnostics = require('../diagnostics');
var ActionSources = require('../internalConstants').ActionSources;

module.exports = {
  dispatch: dispatchAction,
  dispatchViewAction: dispatchViewAction,
  dispatchServerAction: dispatchServerAction
};

function dispatchViewAction(actionType) {
  return dispatch({
    arguments: arguments,
    actionType: actionType,
    creator: this.__creator,
    source: ActionSources.VIEW
  }, this.__dispatcher);
}

function dispatchServerAction(actionType) {
  return dispatch({
    arguments: arguments,
    actionType: actionType,
    creator: this.__creator,
    source: ActionSources.SERVER
  }, this.__dispatcher);
}

function dispatchAction(actionType) {
  return dispatch({
    arguments: arguments,
    actionType: actionType,
    creator: this.__creator
  }, this.__dispatcher);
}

function dispatch(prop, dispatcher) {
  var action = new Action(
    prop.actionType,
    actionArguments(prop.arguments),
    prop.source,
    prop.creator
  );

  if (diagnostics.enabled) {
    diagnostics.dispatchingAction(action);
  }

  dispatcher.dispatch(action);

  return action;
}

function actionArguments(args) {
  args = _.toArray(args);
  args.shift();
  return args;
}