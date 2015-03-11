var _ = require('./utils/mindash');
var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var ActionPayload = require('./actionPayload');
var EventEmitter = require('events').EventEmitter;
var defaultDispatcher = createDefaultDispatcher();
var ACTION_DISPATCHED = 'ACTION_DISPATCHED';

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
  var emitter = new EventEmitter();
  var dispatcher = new Dispatcher();

  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  dispatcher.dispatchAction = function (options) {
    var action = new ActionPayload(options);

    this.dispatch(action);

    action.handled();
    emitter.emit(ACTION_DISPATCHED, action);

    return action;
  };

  dispatcher.onActionDispatched = function (callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(ACTION_DISPATCHED, callback);

    return {
      dispose: function () {
        emitter.removeListener(ACTION_DISPATCHED, callback);
      }
    };
  };

  return dispatcher;
}

