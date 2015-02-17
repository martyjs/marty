var _ = require('underscore');
var warnings = require('./warnings');
var constants = require('./constants');
var STORE_CHANGED_EVENT = 'store-changed';
var StateMixin = require('./mixins/stateMixin');

module.exports = {
  createStore: createStore,
  createContext: createContext,
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createStateSource: createStateSource,
  createActionCreators: createActionCreators,
  addStoreChangeListener: addStoreChangeListener
};

function addStoreChangeListener(callback, context) {
  var events = this.__events;

  if (context) {
    callback = _.bind(callback, context);
  }

  events.on(STORE_CHANGED_EVENT, callback);

  return {
    dispose: _.bind(function () {
      events.removeListener(STORE_CHANGED_EVENT, callback);
    }, this)
  };
}

function createContext(req) {
  return this.container.createContext(req);
}

function createStore(options) {
  var store = this.container.registerStore(options);

  warnings.without('callingResolverOnServer', function () {
    store.addChangeListener(_.bind(onStoreChanged, this));
  }, this);

  return store;
}

function onStoreChanged() {
  var events = this.__events;
  var args = _.toArray(arguments);

  args.unshift(STORE_CHANGED_EVENT);
  events.emit.apply(events, args);
}

function createConstants(obj) {
  return constants(obj);
}

function createStateMixin(options) {
  return new StateMixin(options);
}

function createActionCreators(options) {
  return this.container.registerActionCreators(options);
}

function createStateSource(options) {
  return this.container.registerStateSource(options);
}