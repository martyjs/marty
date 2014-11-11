var _ = require('lodash');
var util = require('util');
var CHANGE_EVENT = 'changed';
var trace = require('./diagnostics').trace;
var EventEmitter = require('events').EventEmitter;

function Store(options) {
  var state;

  EventEmitter.call(this);

  _.extend(this, _.defaults(options, {
    handlers: {},
    waitFor: waitFor,
    setState: setState,
    getState: getState,
    initialize: initialize,
    hasChanged: hasChanged,
    handlePayload: handlePayload,
    getInitialState: getInitialState,
    addChangeListener: addChangeListener,
    removeChangeListener: removeChangeListener
  }));

  this.dispatchToken = options.dispatcher.register(_.bind(this.handlePayload, this));

  trace.storeRegisteredWithDispatcher(this, this.dispatchToken);

  this.initialize.apply(this, arguments);
  state = this.getInitialState();

  if (Object.defineProperty) {
    Object.defineProperty(this, 'state', {
      get: function () {
        return state;
      },
      set: function (value) {
        this.setState(value);
      }
    });
  } else {
    this.state = state;
  }

  function initialize() {
  }

  function getInitialState() {
    return {};
  }

  function getState() {
    return state;
  }

  function setState(newState) {
    if (state !== newState) {
      state = newState;
      this.hasChanged(state);
    }
  }

  function removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  function addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  function hasChanged() {
    this.emit(CHANGE_EVENT, this.state, this);
  }

  function handlePayload(payload) {
    _.each(this.handlers, function (actionTypes, handler) {
      _.isArray(actionTypes) || (actionTypes = [actionTypes]);
      _.each(actionTypes, function (actionType) {
        if (payload.actionType === actionType) {
          this[handler].call(this, payload.data);
          trace.storeHandledPayload(this, payload, handler);
        } else {
          trace.storeDidNotHandlePayload(this, payload);
        }
      }, this);
    }, this);
  }

  function waitFor() {
    options.dispatcher.waitFor(dispatchTokens(_.toArray(arguments)));

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

util.inherits(Store, EventEmitter);

module.exports = Store;