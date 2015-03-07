var CHANGE_EVENT = 'changed';
var log = require('../logger');
var fetch = require('./fetch');
var _ = require('../utils/mindash');
var uuid = require('../utils/uuid');
var warnings = require('../warnings');
var Instances = require('../instances');
var resolve = require('../utils/resolve');
var Environment = require('../environment');
var handleAction = require('./handleAction');
var EventEmitter = require('events').EventEmitter;
var validateHandlers = require('./validateHandlers');

var DEFAULT_MAX_LISTENERS = 1000000;

class Store {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    this.__type = 'Store';
    this.__id = uuid.type(this.__type);

    var instance = Instances.add(this, _.extend({
      state: {},
      fetchHistory: {},
      failedFetches: {},
      fetchInProgress: {},
      emitter: new EventEmitter(),
      validateHandlers: _.once(() => validateHandlers(this))
    }, options));

    var emitter = instance.emitter;
    var dispatcher = instance.dispatcher;
    var initialState = this.getInitialState();

    emitter.setMaxListeners(DEFAULT_MAX_LISTENERS);

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = dispatcher.register(
      _.bind(this.handleAction, this)
    );
  }

  for (obj) {
    return resolve(this, obj);
  }

  get context() {
    return getInstance(this).context;
  }

  get state() {
    return this.getState();
  }

  set state(newState) {
    this.replaceState(newState);
  }

  getInitialState() {
    return {};
  }

  getState() {
    return getInstance(this).state;
  }

  setState(state) {
    var newState = _.extend({}, this.state, state);

    this.replaceState(newState);
  }

  replaceState(newState) {
    var instance = getInstance(this);
    var currentState = instance.state;


    if (_.isUndefined(newState) || _.isNull(newState)) {
      if (warnings.stateIsNullOrUndefined) {
        var displayName = this.displayName || this.id;

        log.warn(
          `Warning: Trying to replace the state of the store ${displayName} with null or undefined`
        );
      }
    }

    if (newState !== currentState) {
      instance.state = newState;
      this.hasChanged();
    }
  }

  clear(newState) {
    var instance = getInstance(this);
    instance.fetchHistory = {};
    instance.failedFetches = {};
    instance.fetchInProgress = {};
    this.state = newState || {};
  }

  dispose() {
    var instance = getInstance(this);
    var emitter = instance.emitter;
    var dispatchToken = this.dispatchToken;

    emitter.removeAllListeners(CHANGE_EVENT);
    this.clear();

    if (dispatchToken) {
      instance.dispatcher.unregister(dispatchToken);
      this.dispatchToken = undefined;
    }

    Instances.dispose(this);
  }

  hasChanged(eventArgs) {
    var instance = getInstance(this);

    if (instance) {
      var emitter = instance.emitter;

      emitter.emit.call(emitter, CHANGE_EVENT, this.state, this, eventArgs);
    }
  }

  hasAlreadyFetched(fetchId) {
    return !!getInstance(this).fetchHistory[fetchId];
  }

  addChangeListener(callback, context) {
    var emitter = getInstance(this).emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    log.trace(
      `The ${this.displayName} store (${this.id}) is adding a change listener`
    );

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: () => {
        log.trace(
          `The ${this.displayName} store (${this.id}) is disposing of a change listener`
        );

        emitter.removeListener(CHANGE_EVENT, callback);
      }
    };
  }

  waitFor(stores) {
    var dispatcher = getInstance(this).dispatcher;

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

Store.prototype.fetch = fetch;
Store.prototype.handleAction = handleAction;

function getInstance(store) {
  return Instances.get(store);
}

module.exports = Store;