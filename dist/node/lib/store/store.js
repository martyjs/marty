"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var CHANGE_EVENT = "changed";
var _ = require("underscore");
var log = require("../logger");
var fetch = require("./fetch");
var uuid = require("../utils/uuid");
var warnings = require("../warnings");
var Instances = require("../instances");
var resolve = require("../utils/resolve");
var Environment = require("../environment");
var handleAction = require("./handleAction");
var EventEmitter = require("events").EventEmitter;
var validateHandlers = require("./validateHandlers");

var DEFAULT_MAX_LISTENERS = 1000000;

var Store = (function () {
  function Store(options) {
    _classCallCheck(this, Store);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn("Warning: Options were not passed into a store's constructor");
    }

    this.__type = "Store";
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

    this.dispatchToken = dispatcher.register(_.bind(this.handleAction, this));

    instance.validateHandlers = _.once(_.partial(validateHandlers, this));
  }

  _prototypeProperties(Store, null, {
    "for": {
      value: function _for(obj) {
        return resolve(this, obj);
      },
      writable: true,
      configurable: true
    },
    context: {
      get: function () {
        return getInstance(this).context;
      },
      configurable: true
    },
    state: {
      get: function () {
        return this.getState();
      },
      set: function (newState) {
        this.replaceState(newState);
      },
      configurable: true
    },
    getInitialState: {
      value: function getInitialState() {
        return {};
      },
      writable: true,
      configurable: true
    },
    getState: {
      value: function getState() {
        return getInstance(this).state;
      },
      writable: true,
      configurable: true
    },
    setState: {
      value: function setState(state) {
        var newState = _.extend({}, this.state, state);

        this.replaceState(newState);
      },
      writable: true,
      configurable: true
    },
    replaceState: {
      value: function replaceState(newState) {
        var instance = getInstance(this);
        var currentState = instance.state;

        if (_.isUndefined(newState) || _.isNull(newState)) {
          if (warnings.stateIsNullOrUndefined) {
            var displayName = this.displayName || this.id;

            log.warn("Warning: Trying to replace the state of the store " + displayName + " with null or undefined");
          }
        }

        if (newState !== currentState) {
          instance.state = newState;
          this.hasChanged();
        }
      },
      writable: true,
      configurable: true
    },
    clear: {
      value: function clear(newState) {
        var instance = getInstance(this);
        instance.fetchHistory = {};
        instance.failedFetches = {};
        instance.fetchInProgress = {};
        this.state = newState || {};
      },
      writable: true,
      configurable: true
    },
    dispose: {
      value: function dispose() {
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
      },
      writable: true,
      configurable: true
    },
    hasChanged: {
      value: function hasChanged(eventArgs) {
        var instance = getInstance(this);

        if (instance) {
          var emitter = instance.emitter;

          emitter.emit.call(emitter, CHANGE_EVENT, this.state, this, eventArgs);
        }
      },
      writable: true,
      configurable: true
    },
    hasAlreadyFetched: {
      value: function hasAlreadyFetched(fetchId) {
        return !!getInstance(this).fetchHistory[fetchId];
      },
      writable: true,
      configurable: true
    },
    addChangeListener: {
      value: function addChangeListener(callback, context) {
        var _this = this;

        var emitter = getInstance(this).emitter;

        if (context) {
          callback = _.bind(callback, context);
        }

        log.trace("The " + this.displayName + " store (" + this.id + ") is adding a change listener");

        emitter.on(CHANGE_EVENT, callback);

        return {
          dispose: function () {
            log.trace("The " + _this.displayName + " store (" + _this.id + ") is disposing of a change listener");

            emitter.removeListener(CHANGE_EVENT, callback);
          }
        };
      },
      writable: true,
      configurable: true
    },
    waitFor: {
      value: function waitFor(stores) {
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
      },
      writable: true,
      configurable: true
    }
  });

  return Store;
})();

Store.prototype.fetch = fetch;
Store.prototype.handleAction = handleAction;

function getInstance(store) {
  return Instances.get(store);
}

module.exports = Store;