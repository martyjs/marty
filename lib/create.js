var _ = require('underscore');
var Container = require('./container');
var constants = require('./constants');
var StateMixin = require('./mixins/stateMixin');
var EventEmitter = require('events').EventEmitter;

var STORE_CHANGED_EVENT = 'store-changed';

var stores = [];
var emitter = new EventEmitter();

module.exports = {
  getStores: getStores,
  createStore: createStore,
  createContext: createContext,
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createStateSource: createStateSource,
  createActionCreators: createActionCreators,
  addStoreChangeListener: addStoreChangeListener
};

function addStoreChangeListener(callback, context) {
  if (context) {
    callback = _.bind(callback, context);
  }

  emitter.on(STORE_CHANGED_EVENT, callback);

  return {
    dispose: function () {
      emitter.removeListener(STORE_CHANGED_EVENT, callback);
    }
  };
}

function getStores() {
  return stores;
}

function createContext() {
  return this.container.createContext();
}

function createStore(options) {
  var store = this.container.registerStore(options);

  store.addChangeListener(onStoreChanged);
  stores.push(store);

  return store;
}

function onStoreChanged() {
  var args = _.toArray(arguments);

  args.unshift(STORE_CHANGED_EVENT);

  emitter.emit.apply(emitter, args);
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