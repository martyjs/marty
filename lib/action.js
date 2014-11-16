var _ = require('./utils/tinydash');
var cloneState = require('./utils/cloneState');

function Action(type, args, source, creator) {
  var handlers = [];
  var rollbackHandlers = [];

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
      exception: null,
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
        viewHandler.exception = err;
      }
    };
  }

  function addStoreHandler(store, handlerName) {
    var handler = {
      views: [],
      type: 'Store',
      exception: null,
      name: store.name,
      action: handlerName,
      state: {
        before: cloneState(store.state),
        after: undefined
      },
    };

    handlers.push(handler);

    return {
      dispose: function () {
        handler.state.after = cloneState(store.state);
      },
      failed: function (err) {
        handler.exception = err;
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