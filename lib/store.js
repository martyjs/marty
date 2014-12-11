var CHANGE_EVENT = 'changed';
var uuid = require('./utils/uuid');
var _ = require('./utils/tinydash');
var StoreQuery = require('./storeQuery');
var Dispatcher = require('./dispatcher');
var Diagnostics = require('./diagnostics');
var EventEmitter = require('events').EventEmitter;
var StoreQueryResult = require('./storeQuery/result');
var Statuses = require('./internalConstants').Statuses;
var ActionHandlerNotFoundError = require('./errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('./errors/actionPredicateUndefined');

Store.defaultMaxListeners = 10000000;

function Store(options) {
  var state;
  var queries = {};
  var store = this;
  var queryErrors = {};
  var defaultState = {};
  var emitter = new EventEmitter();
  var dispatcher = options.dispatcher || Dispatcher.getCurrent();

  this.handlers = {};
  this.query = query;
  this.clear = clear;
  this.dispose = dispose;
  this.waitFor = waitFor;
  this.id = uuid.small();
  this.setState = setState;
  this.getState = getState;
  this.hasChanged = hasChanged;
  this.handleAction = handleAction;
  this.getInitialState = getInitialState;
  this.addChangeListener = addChangeListener;

  query.done = queryDone;
  query.failed = queryFailed;
  query.pending = queryPending;

  emitter.setMaxListeners(options.maxListeners || Store.defaultMaxListeners);

  extendStore(this, options);
  validateHandlers(this);

  this.dispatchToken = dispatcher.register(_.bind(this.handleAction, this));
  state = this.getInitialState();

  if (_.isNull(state) || _.isUndefined(state)) {
    state = defaultState;
  }

  Object.defineProperty(this, 'state', {
    get: function () {
      return getState();
    },
    set: function (value) {
      this.setState(value);
    }
  });

  function validateHandlers(store) {
    _.each(store.handlers, function (actionPredicate, handlerName) {
      var actionHandler = store[handlerName];

      if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
        throw new ActionHandlerNotFoundError(handlerName, store);
      }

      if (!actionPredicate) {
        throw new ActionPredicateUndefinedError(handlerName, store);
      }
    });
  }

  function extendStore(store, options) {
    var handlers = _.map(options.mixins, function (mixin) {
      return mixin.handlers;
    });

    var mixins = _.map(options.mixins, function (mixin) {
      return _.omit(mixin, 'handlers');
    });

    _.extend.apply(_, [store, options].concat(mixins));
    _.extend.apply(_, [store.handlers].concat(handlers));
  }

  function getInitialState() {
    return defaultState;
  }

  function dispose() {
    emitter.removeAllListeners(CHANGE_EVENT);
    this.clear();
  }

  function query(key, localQuery, remoteQuery) {
    var storeQuery = queries[key];
    var queryError = queryErrors[key];

    if (storeQuery && !storeQuery.done) {
      return storeQuery;
    }

    if (queryError) {
      return queryFailed(queryError);
    }

    storeQuery = new StoreQuery(this, localQuery, remoteQuery);

    var listener = storeQuery.addChangeListener(function (status, finished) {
      if (finished) {
        delete queries[key];
        listener.dispose();

        if (status === Statuses.ERROR) {
          queryErrors[key] = storeQuery.error;
        }
      }
      this.hasChanged();
    }, this);

    queries[key] = storeQuery;

    return storeQuery;
  }

  function queryDone(result) {
    return new StoreQueryResult({
      status: Statuses.DONE,
      result: result
    });
  }

  function queryFailed(error) {
    return new StoreQueryResult({
      status: Statuses.FAILED,
      error: error
    });
  }

  function queryPending() {
    return new StoreQueryResult({
      status: Statuses.PENDING
    });
  }

  function clear() {
    queries = {};
    queryErrors = {};
    this.state = this.getInitialState();
  }

  function setState(newState) {
    if (state !== newState) {
      state = newState;
      this.hasChanged(state);
    }
  }

  function getState() {
    return state;
  }

  function addChangeListener(callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    Diagnostics.trace('The', store.name, 'store (' + store.id + ') is adding a change listener');
    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: function () {
        Diagnostics.trace('The', store.name, 'store (' + store.id + ') is disposing of a change listener');
        emitter.removeListener(CHANGE_EVENT, callback);
      }
    };
  }

  function hasChanged(eventArgs) {
    emitter.emit.call(emitter, CHANGE_EVENT, this.state, this, eventArgs);
  }

  function handleAction(action) {
    var handlers = _.object(_.map(this.handlers, getHandlerWithPredicates));

    _.each(handlers, function (predicates, handlerName) {
      _.each(predicates, function (predicate) {
        if (predicate(action)) {
          var rollbackHandler, actionHandler;
          var handler = action.addStoreHandler(this, handlerName, predicate.toJSON());

          try {
            this.action = action;
            actionHandler = this[handlerName];

            if (actionHandler) {
              rollbackHandler = actionHandler.apply(this, action.arguments);
            } else {
              throw new ActionHandlerNotFoundError(handlerName, this);
            }
          } catch (e) {
            handler.failed(e);
            throw e;
          } finally {
            this.action = null;

            action.addRollbackHandler(rollbackHandler, this);

            if (handler) {
              handler.dispose();
            }
          }
        }
      }, this);
    }, this);

    function getHandlerWithPredicates(actionPredicates, handler) {
      _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

      var predicates = _.map(actionPredicates, toFunc);

      return [handler, predicates];

      function toFunc(actionPredicate) {
        if (_.isString(actionPredicate)) {
          actionPredicate = {
            type: actionPredicate
          };
        }

        var func = _.createCallback(actionPredicate);

        func.toJSON = function () {
          return actionPredicate;
        };

        return func;
      }
    }
  }

  function waitFor(stores) {
    if (!_.isArray(stores)) {
      stores = _.toArray(arguments);
    }

    dispatcher.waitFor(dispatchTokens(stores));

    function dispatchTokens(stores) {
      var tokens = [];

      _.each(stores, function (store) {
        if (store.dispatchToken) {
          tokens.push(store.dispatchToken);
        }

        if (_.isString(store)) {
          tokens.push(store);
        }
      });

      return tokens;
    }
  }
}

module.exports = Store;