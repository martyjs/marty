"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var log = require("../logger");
var fetch = require("./fetch");
var _ = require("../utils/mindash");
var uuid = require("../utils/uuid");
var warnings = require("../warnings");
var Instances = require("../instances");
var resolve = require("../utils/resolve");
var StoreEvents = require("./storeEvents");
var Environment = require("../environment");
var handleAction = require("./handleAction");
var EventEmitter = require("events").EventEmitter;
var validateHandlers = require("./validateHandlers");

var DEFAULT_MAX_LISTENERS = 1000000;

var Store = (function () {
  function Store(options) {
    var _this = this;

    _classCallCheck(this, Store);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn("Warning: Options were not passed into a store's constructor");
    }

    this.__type = "Store";
    this.__id = uuid.type(this.__type);

    var instance = Instances.add(this, _.extend({
      state: {},
      fetchHistory: {},
      failedFetches: {},
      fetchInProgress: {},
      emitter: new EventEmitter(),
      validateHandlers: _.once(function () {
        return validateHandlers(_this);
      })
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
  }

  _createClass(Store, {
    "for": {
      value: function _for(obj) {
        return resolve(this, obj);
      }
    },
    context: {
      get: function () {
        return getInstance(this).context;
      }
    },
    state: {
      get: function () {
        return this.getState();
      },
      set: function (newState) {
        this.replaceState(newState);
      }
    },
    getInitialState: {
      value: function getInitialState() {
        return {};
      }
    },
    getState: {
      value: function getState() {
        return getInstance(this).state;
      }
    },
    setState: {
      value: function setState(state) {
        var newState = _.extend({}, this.state, state);

        this.replaceState(newState);
      }
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
      }
    },
    clear: {
      value: function clear(newState) {
        var instance = getInstance(this);
        instance.fetchHistory = {};
        instance.failedFetches = {};
        instance.fetchInProgress = {};
        this.state = newState || {};
      }
    },
    dispose: {
      value: function dispose() {
        var instance = getInstance(this);
        var emitter = instance.emitter;
        var dispatchToken = this.dispatchToken;

        emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
        emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
        this.clear();

        if (dispatchToken) {
          instance.dispatcher.unregister(dispatchToken);
          this.dispatchToken = undefined;
        }

        Instances.dispose(this);
      }
    },
    hasChanged: {
      value: function hasChanged(eventArgs) {
        var _this = this;

        var emitChange = function () {
          var instance = getInstance(_this);

          if (instance) {
            var emitter = instance.emitter;

            emitter.emit.call(emitter, StoreEvents.CHANGE_EVENT, _this.state, _this, eventArgs);
          }
        };

        if (this.action) {
          this.action.onActionHandled(this.id, emitChange);
        } else {
          emitChange();
        }
      }
    },
    hasAlreadyFetched: {
      value: function hasAlreadyFetched(fetchId) {
        return !!getInstance(this).fetchHistory[fetchId];
      }
    },
    addChangeListener: {
      value: function addChangeListener(callback, context) {
        var _this = this;

        var emitter = getInstance(this).emitter;

        if (context) {
          callback = _.bind(callback, context);
        }

        log.trace("The " + this.displayName + " store (" + this.id + ") is adding a change listener");

        emitter.on(StoreEvents.CHANGE_EVENT, callback);

        return {
          dispose: function () {
            log.trace("The " + _this.displayName + " store (" + _this.id + ") is disposing of a change listener");

            emitter.removeListener(StoreEvents.CHANGE_EVENT, callback);
          }
        };
      }
    },
    addFetchChangedListener: {
      value: function addFetchChangedListener(callback, context) {
        var emitter = getInstance(this).emitter;

        if (context) {
          callback = _.bind(callback, context);
        }

        emitter.on(StoreEvents.FETCH_CHANGE_EVENT, callback);

        return {
          dispose: function () {
            emitter.removeListener(StoreEvents.FETCH_CHANGE_EVENT, callback);
          }
        };
      }
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
      }
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