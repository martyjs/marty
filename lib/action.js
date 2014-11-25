var _ = require('./utils/tinydash');
var constants = require('./constants');
var cloneState = require('./utils/cloneState');
var statuses = constants(['pending', 'failed', 'done']);

function Action(type, args, source, creator) {
  var handlers = [];
  var rollbackHandlers = [];
  var status = statuses.pending;

  this.type = type;
  this.source = source;
  this.arguments = args;
  this.creator = creator;

  this.toJSON = toJSON;
  this.toString = toString;
  this.rollback = rollback;
  this.addViewHandler = addViewHandler;
  this.addStoreHandler = addStoreHandler;
  this.addRollbackHandler = addRollbackHandler;

  Object.defineProperty(this, 'handlers', {
    get: function () {
      return handlers;
    }
  });

  Object.defineProperty(this, 'status', {
    get: function () {
      return status;
    }
  });

  Object.defineProperty(this, 'done', {
    get: function () {
      return isDone(status);
    }
  });

  function isDone() {
    return false;
  }

  function toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  function toJSON() {
    return {
      type: this.type,
      source: this.source,
      creator: this.creator,
      handlers: this.handlers,
      arguments: this.arguments
    };
  }

  function rollback() {
    _.each(rollbackHandlers, function (rollback) {
      rollback();
    });
  }

  function addViewHandler(name, view, lastState) {
    var storeHandler = handlers[handlers.length - 1];

    var viewHandler = {
      name: name,
      error: null,
      state: {
        after: null,
        before: lastState
      }
    };

    storeHandler.views.push(viewHandler);

    return {
      dispose: function () {
        viewHandler.state.after = cloneState(view.state);
      },
      failed: function (err) {
        viewHandler.error = err;
      }
    };
  }

  function addStoreHandler(store, handlerName) {
    var handler = {
      views: [],
      type: 'Store',
      error: null,
      store: store.name,
      name: handlerName,
      state: {
        before: cloneState(store.getState()),
        after: undefined
      },
    };

    handlers.push(handler);

    return {
      dispose: function () {
        handler.state.after = cloneState(store.getState());
      },
      failed: function (err) {
        handler.error = err;
      }
    };
  }

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = Action;