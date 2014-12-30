var CHANGE_EVENT = 'changed';
var _ = require('underscore');
var uuid = require('./utils/uuid');
var Dispatcher = require('./dispatcher');
var Diagnostics = require('./diagnostics');
var CompoundError = require('../errors/compound');
var NotFoundError = require('../errors/notFound');
var EventEmitter = require('events').EventEmitter;
var StatusConstants = require('../constants/status');
var ActionHandlerNotFoundError = require('../errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('../errors/actionPredicateUndefined');

Store.defaultMaxListeners = 10000000;

function Store(options) {
  var state;
  var store = this;
  var failedFetches = {};
  var defaultState = {};
  var fetchInProgress = {};
  var emitter = new EventEmitter();
  var dispatcher = options.dispatcher || Dispatcher.getCurrent();

  this.handlers = {};
  this.fetch = fetch;
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

  fetch.done = fetchDone;
  fetch.failed = fetchFailed;
  fetch.pending = fetchPending;
  fetch.notFound = fetchNotFound;

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
    store.clear();
  }

  function fetch(id, local, remote) {
    var options, result, error, cacheError;

    if (_.isObject(id)) {
      options = id;
    } else {
      options = {
        id: id,
        locally: local,
        remotely: remote
      };
    }

    if (!options || !options.id) {
      throw new Error('must specify an id');
    }

    result = dependencyResult(options);

    if (result) {
      return result;
    }

    cacheError = _.isUndefined(options.cacheError) || options.cacheError;

    if (cacheError) {
      error = failedFetches[options.id];

      if (error) {
        return fetch.failed(error);
      }
    }

    if (fetchInProgress[options.id]) {
      return fetch.pending();
    }

    return tryAndGetLocally() || tryAndGetRemotely();

    function tryAndGetLocally() {
      try {
        var result = options.locally.call(store);

        if (result) {
          return fetch.done(result);
        }
      } catch (error) {
        failedFetches[options.id] = error;

        return fetch.failed(error);
      }
    }

    function tryAndGetRemotely() {
      try {
        result = options.remotely.call(store);

        if (result) {
          if (_.isFunction(result.then)) {
            fetchInProgress[options.id] = true;

            result.then(function () {
              result = tryAndGetLocally();

              if (result) {
                fetchFinished();
                hasChanged();
              } else {
                failed(new NotFoundError());
                hasChanged();
              }
            }).catch(function (error) {
              failed(error);
              hasChanged();
            });

            return fetch.pending();
          } else {
            result = tryAndGetLocally();

            if (result) {
              return result;
            }
          }
        }

        return failed(new NotFoundError());
      } catch (error) {
        return failed(error);
      }
    }

    function fetchFinished() {
      delete fetchInProgress[options.id];
    }

    function failed(error) {
      if (cacheError) {
        failedFetches[options.id] = error;
      }

      return fetch.failed(error);
    }
  }

  function dependencyResult(options) {
    if (options.dependsOn) {
      if (_.isArray(options.dependsOn)) {
        var pending = false;
        var dependencyErrors = [];
        for (var i = 0; i < options.dependsOn.length; i++) {
          var dependency = options.dependsOn[i];

          switch (dependency.status) {
            case StatusConstants.PENDING.toString():
              pending = true;
              break;
            case StatusConstants.FAILED.toString():
              dependencyErrors.push(dependency.error);
              break;
          }
        }

        if (dependencyErrors.length) {
          return fetch.failed(new CompoundError(dependencyErrors));
        }

        if (pending) {
          return fetch.pending();
        }
      } else {
        if (!options.dependsOn.done) {
          return options.dependsOn;
        }
      }
    }
  }

  function fetchPending() {
    return fetchResult({
      pending: true,
      status: 'PENDING'
    });
  }

  function fetchFailed(error) {
    return fetchResult({
      error: error,
      failed: true,
      status: 'FAILED'
    });
  }

  function fetchDone(result) {
    return fetchResult({
      done: true,
      status: 'DONE',
      result: result
    });
  }

  function fetchNotFound() {
    return fetchFailed(new NotFoundError());
  }

  function fetchResult(result) {
    result.when = when;

    return result;
  }

  function when(handlers) {
    handlers || (handlers = {});

    var status = this.status;
    var handler = handlers[status.toLowerCase()];

    if (!handler) {
      throw new Error('Could not find a ' + status + ' handler');
    }

    switch (status) {
      case StatusConstants.PENDING.toString():
        return handler.call(handlers);
      case StatusConstants.FAILED.toString():
        return handler.call(handlers, this.error);
      case StatusConstants.DONE.toString():
        return handler.call(handlers, this.result);
    }
  }

  function clear() {
    failedFetches = {};
    fetchInProgress = {};
    store.state = store.getInitialState();
  }

  function setState(newState) {
    if (state !== newState) {
      state = newState;
      store.hasChanged(state);
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
    emitter.emit.call(emitter, CHANGE_EVENT, store.state, store, eventArgs);
  }

  function handleAction(action) {
    var handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

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
        if (actionPredicate.isActionCreator) {
          actionPredicate = {
            type: actionPredicate.toString()
          };
        } else if (_.isString(actionPredicate)) {
          actionPredicate = {
            type: actionPredicate
          };
        }

        var func = _.matches(actionPredicate);

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