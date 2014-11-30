var CHANGE_EVENT = 'changed';
var _ = require('./utils/tinydash');
var StoreQuery = require('./storeQuery');
var EventEmitter = require('events').EventEmitter;
var ActionHandlerNotFoundError = require('./errors/actionHandlerNotFound');

function Store(options) {
  var state;
  var queries = {};
  var defaultState = {};
  var emitter = new EventEmitter();

  this.handlers = {};
  this.query = query;
  this.clear = clear;
  this.dispose = dispose;
  this.waitFor = waitFor;
  this.setState = setState;
  this.getState = getState;
  this.hasChanged = hasChanged;
  this.handleAction = handleAction;
  this.getInitialState = getInitialState;
  this.addChangeListener = addChangeListener;

  _.extend.apply(_, [this, options].concat(options.mixins));

  this.dispatchToken = options.dispatcher.register(_.bind(this.handleAction, this));
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

  function getInitialState() {
    return defaultState;
  }

  function dispose() {
    emitter.removeAllListeners(CHANGE_EVENT);
    this.clear();
  }

  function query(key, localQuery, remoteQuery) {
    var storeQuery = queries[key];

    if (storeQuery && !storeQuery.complete) {
      return storeQuery;
    }

    storeQuery = new StoreQuery(this, localQuery, remoteQuery);

    var listener = storeQuery.addChangeListener(function (status, finished) {
      if (finished) {
        delete queries[key];
        listener.dispose();
      }
      this.hasChanged();
    }, this);

    queries[key] = storeQuery;

    return storeQuery;
  }

  function clear() {
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

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: function () {
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

    options.dispatcher.waitFor(dispatchTokens(stores));

    function dispatchTokens(stores) {
      return _.chain(stores).map(storeOrToken).filter(nulls).value();

      function storeOrToken(store) {
        if (store.dispatchToken) {
          return store.dispatchToken;
        }

        if (_.isString(store)) {
          return store;
        }
      }

      function nulls(obj) {
        return obj;
      }
    }
  }
}

module.exports = Store;