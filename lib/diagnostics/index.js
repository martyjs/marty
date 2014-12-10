var ACTION_STARTED = 'action-started';
var EventEmitter = require('events').EventEmitter;
var diagnosticEvents = new EventEmitter();

var diagnostics = {
  log: log,
  trace: log,
  warn: warn,
  enabled: false,
  onAction: onAction,
  dispatchingAction: dispatchingAction
};

module.exports = diagnostics;

function dispatchingAction(action) {
  diagnosticEvents.emit(ACTION_STARTED, action);
}

function log() {
  if (diagnostics.enabled) {
    console.log.apply(console, arguments);
  }
}

function warn() {
  if (diagnostics.enabled) {
    console.warn.apply(console, arguments);
  }
}

function onAction(callback) {
  diagnosticEvents.on(ACTION_STARTED, callback);

  return {
    dispose: function () {
      diagnosticEvents.removeListener(ACTION_STARTED, callback);
    }
  };
}