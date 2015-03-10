var _ = require('./utils/mindash');
var uuid = require('./utils/uuid');

function ActionPayload(options) {
  options || (options = {});

  var rollbackHandlers = [];
  var actionHandledCallbacks = {};
  var handlers = options.handlers || [];

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.rollback = rollback;
  this.addViewHandler = addViewHandler;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addRollbackHandler = addRollbackHandler;
  this.timestamp = options.timestamp || new Date();

  Object.defineProperty(this, 'handlers', {
    get: function () {
      return handlers;
    }
  });

  function actionType(type) {
    if (_.isFunction(type)) {
      return type.toString();
    }

    return type;
  }

  function toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  function toJSON() {
    var json = _.pick(this,
      'id',
      'type',
      'handlers',
      'arguments',
      'timestamp'
    );

    return json;
  }

  function rollback() {
    _.each(rollbackHandlers, rollback => rollback(this.error));
  }

  function handled() {
    _.each(actionHandledCallbacks, callback => callback());
  }

  function onActionHandled(id, cb) {
    actionHandledCallbacks[id] = cb;
  }

  function addViewHandler(name) {
    var storeHandler = handlers[handlers.length - 1];

    var viewHandler = {
      name: name,
      error: null,
      id: uuid.small(),
    };

    storeHandler.views.push(viewHandler);
  }

  function addStoreHandler(store, handlerName) {
    var handler = {
      views: [],
      type: 'Store',
      id: uuid.small(),
      name: handlerName,
      store: store.displayName,
    };

    handlers.push(handler);
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

module.exports = ActionPayload;