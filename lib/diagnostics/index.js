var ACTION_STARTED = 'action-started';
var EventEmitter = require('events').EventEmitter;
var diagnosticEvents = new EventEmitter();

module.exports = {
  enabled: false,
  onAction: onAction,
  dispatchingAction: dispatchingAction
};

function dispatchingAction(action) {
  diagnosticEvents.emit(ACTION_STARTED, action);
}

function onAction(callback) {
  diagnosticEvents.on(ACTION_STARTED, callback);

  return {
    dispose: function () {
      diagnosticEvents.removeListener(ACTION_STARTED, callback);
    }
  };
}