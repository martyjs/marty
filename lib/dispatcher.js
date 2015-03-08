var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var ActionPayload = require('./actionPayload');
var defaultDispatcher = createDefaultDispatcher();

createDispatcher.getDefault = function () {
  return defaultDispatcher;
};

createDispatcher.dispose = function () {
  defaultDispatcher = createDefaultDispatcher();
};

module.exports = createDispatcher;

function createDefaultDispatcher() {
  var defaultDispatcher = createDispatcher();
  defaultDispatcher.isDefault = true;
  return defaultDispatcher;
}

function createDispatcher() {
  var dispatcher = new Dispatcher();

  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  dispatcher.dispatchAction = dispatchAction;

  return dispatcher;
}

function dispatchAction(options) {
  var action = new ActionPayload(options);

  this.dispatch(action);

  action.handled();

  return action;
}