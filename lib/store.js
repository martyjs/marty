var CHANGE_EVENT = 'changed';
var _ = require('underscore');
var uuid = require('./utils/uuid');
var fetchResult = require('./fetch');
var Dispatcher = require('./dispatcher');
var Diagnostics = require('./diagnostics');
var CompoundError = require('../errors/compound');
var NotFoundError = require('../errors/notFound');
var EventEmitter = require('events').EventEmitter;
var StatusConstants = require('../constants/status');
var ActionHandlerNotFoundError = require('../errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('../errors/actionPredicateUndefined');

var RESERVED_FUNCTIONS = ['getState'];
var REQUIRED_FUNCTIONS = ['getInitialState'];
var PROTECTED_FUNCTIONS = ['clear', 'dispose'];

Store.defaultMaxListeners = 10000000;

function Store(options) {
  var state;
  var store = this;
  var defaultState = {};
  var fetchHistory = {};
  var failedFetches = {};
  var fetchInProgress = {};
  var emitter = new EventEmitter();
  var dispatcher = options.dispatcher || Dispatcher.getCurrent();

  this.handlers = {};
  this.clear = clear;
  this.dispose = dispose;
  this.waitFor = waitFor;
  this.id = uuid.small();
  this.fetch = fetchState;
  this.setState = setState;
  this.getState = getState;
  this.hasChanged = hasChanged;
  this.handleAction = handleAction;
  this.hasAlreadyFetched = hasAlreadyFetched;
  this.addChangeListener = addChangeListener;

  this.fetch.done = fetchResult.done;
  this.fetch.failed = fetchResult.failed;
  this.fetch.pending = fetchResult.pending;
  this.fetch.notFound = fetchResult.notFound;

  emitter.setMaxListeners(options.maxListeners || Store.defaultMaxListeners);

  validateOptions(options);
  extendStore(this, _.omit(options, _.union(PROTECTED_FUNCTIONS, RESERVED_FUNCTIONS)));
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

  function validateOptions(options) {
    var missingFunctions = [];

    _.each(RESERVED_FUNCTIONS, function (functionName) {
      if (options[functionName]) {
        if (options.displayName) {
          functionName += ' in ' + options.displayName;
        }

        Diagnostics.warn('Warning:', functionName, 'is reserved for use by Marty. Please use a different name');
      }
    });

    _.each(REQUIRED_FUNCTIONS, function (functionName) {
      if (!_.has(options, functionName)) {
        missingFunctions.push(functionName);
      }
    });

    if (missingFunctions.length) {
      var error = 'You must implement ' + missingFunctions.join(',');

      if (options.displayName) {
        error += ' in ' + options.displayName;
      }

      throw new Error(error);
    }
  }

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

  function dispose() {
    emitter.removeAllListeners(CHANGE_EVENT);
    store.clear();

    if (_.isFunction(options.dispose)) {
      options.dispose.call(store);
    }

    if (store.dispatchToken) {
      dispatcher.unregister(store.dispatchToken);
      store.dispatchToken = undefined;
    }
  }

  function hasAlreadyFetched(fetchId) {
    return !!fetchHistory[fetchId];
  }

  function fetchState(id, local, remote) {
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

    _.defaults(options, {
      locally: _.noop,
      remotely: _.noop
    });

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
        return fetchResult.failed(error);
      }
    }

    if (fetchInProgress[options.id]) {
      return fetchResult.pending();
    }

    return tryAndGetLocally() || tryAndGetRemotely();

    function tryAndGetLocally() {
      try {
        var result = options.locally.call(store);

        if (_.isUndefined(result)) {
          return;
        }

        if (_.isNull(result)) {
          return notFound();
        }

        finished();
        return fetchResult.done(result);
      } catch (error) {
        failed(error);

        return fetchResult.failed(error);
      }
    }

    function tryAndGetRemotely() {
      try {
        result = options.remotely.call(store);

        if (result) {
          if (_.isFunction(result.then)) {
            fetchInProgress[options.id] = true;

            result.then(function () {
              fetchHistory[options.id] = true;
              result = tryAndGetLocally();

              if (result) {
                finished();
                hasChanged();
              } else {
                notFound();
                hasChanged();
              }
            }).catch(function (error) {
              failed(error);
              hasChanged();
            });

            return fetchResult.pending();
          } else {
            fetchHistory[options.id] = true;
            result = tryAndGetLocally();

            if (result) {
              return result;
            }
          }
        }

        Diagnostics.warn(promiseNotReturnedWarning());

        return notFound();
      } catch (error) {
        return failed(error);
      }
    }

    function promiseNotReturnedWarning() {
      var inStore = '';
      if (store.displayName) {
        inStore = ' in ' + store.displayName;
      }

      return 'Warning: The remote fetch for \'' + options.id + '\'' +
        inStore + ' did not return a promise and the state was ' +
        'not present after remotely finished executing. ' +
        'This might be because you forgot to return a promise.';
    }

    function finished() {
      fetchHistory[options.id] = true;
      delete fetchInProgress[options.id];
    }

    function failed(error) {
      if (cacheError) {
        failedFetches[options.id] = error;
      }

      finished();

      return fetchResult.failed(error);
    }

    function notFound() {
      return failed(new NotFoundError());
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
          return fetchResult.failed(new CompoundError(dependencyErrors));
        }

        if (pending) {
          return fetchResult.pending();
        }
      } else {
        if (!options.dependsOn.done) {
          return options.dependsOn;
        }
      }
    }
  }

  function clear() {
    failedFetches = {};
    fetchInProgress = {};
    store.state = store.getInitialState();

    if (_.isFunction(options.clear)) {
      options.clear.call(store);
    }
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

    Diagnostics.trace('The', store.displayName, 'store (' + store.id + ') is adding a change listener');
    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: function () {
        Diagnostics.trace('The', store.displayName, 'store (' + store.id + ') is disposing of a change listener');
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
