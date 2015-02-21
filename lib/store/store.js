var CHANGE_EVENT = 'changed';
var _ = require('underscore');
var log = require('../logger');
var fetch = require('./fetch');
var uuid = require('../utils/uuid');
var warnings = require('../warnings');
var Instances = require('../instances');
var resolve = require('../utils/resolve');
var Diagnostics = require('../diagnostics');
var handleAction = require('./handleAction');
var EventEmitter = require('events').EventEmitter;
var validateHandlers = require('./validateHandlers');

var DEFAULT_MAX_LISTENERS = 1000000;

function getInstance(store) {
  return Instances.get(store);
}

class Store {
  constructor(options) {
    options = options || {};

    this.__type = 'Store';
    this.__id = uuid.type(this.__type);

    var instance = Instances.add(this, _.extend({
      state: {},
      defaultState: {},
      fetchHistory: {},
      failedFetches: {},
      fetchInProgress: {},
      emitter: new EventEmitter()
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

    instance.validateHandlers = _.once(
      _.partial(validateHandlers, this)
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
    throw new Error('You must implement `getInitialState`');
  }

  setInitialState(state) {
    this.state = this.getInitialState(state);
  }

  getState() {
    return getInstance(this).state;
  }

  setState(state) {
    console.warn('UN-TESTED');

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
          'Warning: Trying to replace the state of the store ' +
          displayName + ' with null or undefined'
        );
      }
    }

    if (newState !== currentState) {
      instance.state = newState;
      this.hasChanged();
    }
  }

  clear() {
    var instance = getInstance(this);
    instance.failedFetches = {};
    instance.fetchInProgress = {};
    this.state = this.getInitialState();
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

    Diagnostics.trace(
      'The', this.displayName,
      'store (' + this.id + ') is adding a change listener'
    );

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: () => {
        Diagnostics.trace(
          'The', this.displayName,
          'store (' + this.id + ') is disposing of a change listener'
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

module.exports = Store;