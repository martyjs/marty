let log = require('../logger');
let fetch = require('./fetch');
let _ = require('../utils/mindash');
let uuid = require('../utils/uuid');
let warnings = require('../warnings');
let Instances = require('../instances');
let resolve = require('../utils/resolve');
let StoreEvents = require('./storeEvents');
let Environment = require('../environment');
let handleAction = require('./handleAction');
let EventEmitter = require('events').EventEmitter;
let validateHandlers = require('./validateHandlers');

let DEFAULT_MAX_LISTENERS = 1000000;

class Store {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    this.__type = 'Store';
    this.__id = uuid.type(this.__type);

    let instance = Instances.add(this, _.extend({
      state: {},
      fetchHistory: {},
      failedFetches: {},
      fetchInProgress: {},
      emitter: new EventEmitter(),
      validateHandlers: _.once(() => validateHandlers(this))
    }, options));

    let emitter = instance.emitter;
    let dispatcher = instance.dispatcher;
    let initialState = this.getInitialState();

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
    let newState = _.extend({}, this.state, state);

    this.replaceState(newState);
  }

  replaceState(newState) {
    let instance = getInstance(this);
    let currentState = instance.state;


    if (_.isUndefined(newState) || _.isNull(newState)) {
      if (warnings.stateIsNullOrUndefined) {
        let displayName = this.displayName || this.id;

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
    let instance = getInstance(this);
    instance.fetchHistory = {};
    instance.failedFetches = {};
    instance.fetchInProgress = {};

    if (!newState && _.isFunction(this.getInitialState)) {
      newState = this.getInitialState();
    }

    this.state = newState || {};
  }

  dispose() {
    let instance = getInstance(this);
    let emitter = instance.emitter;
    let dispatchToken = this.dispatchToken;

    emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
    emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
    this.clear();

    if (dispatchToken) {
      instance.dispatcher.unregister(dispatchToken);
      this.dispatchToken = undefined;
    }

    Instances.dispose(this);
  }

  hasChanged(eventArgs) {
    let emitChange = () => {
      let instance = getInstance(this);

      if (instance) {
        let emitter = instance.emitter;

        emitter.emit.call(emitter, StoreEvents.CHANGE_EVENT, this.state, this, eventArgs);
      }

      // Clear the action once the component has seen it
      this.action = null;
    };

    if (this.action) {
      this.action.onActionHandled(this.id, emitChange);
    } else {
      emitChange();
    }
  }

  hasAlreadyFetched(fetchId) {
    return !!getInstance(this).fetchHistory[fetchId];
  }

  addChangeListener(callback, context) {
    let emitter = getInstance(this).emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    log.trace(
      `The ${this.displayName} store (${this.id}) is adding a change listener`
    );

    emitter.on(StoreEvents.CHANGE_EVENT, callback);

    return {
      dispose: () => {
        log.trace(
          `The ${this.displayName} store (${this.id}) is disposing of a change listener`
        );

        emitter.removeListener(StoreEvents.CHANGE_EVENT, callback);
      }
    };
  }

  addFetchChangedListener(callback, context) {
    let emitter = getInstance(this).emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(StoreEvents.FETCH_CHANGE_EVENT, callback);

    return {
      dispose: () => {
        emitter.removeListener(StoreEvents.FETCH_CHANGE_EVENT, callback);
      }
    };
  }

  waitFor(stores) {
    let dispatcher = getInstance(this).dispatcher;

    if (!_.isArray(stores)) {
      stores = _.toArray(arguments);
    }

    dispatcher.waitFor(dispatchTokens(stores));

    function dispatchTokens(stores) {
      let tokens = [];

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