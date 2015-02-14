var _ = require('underscore');
var constants = require('./constants');
var STORE_CHANGED_EVENT = 'store-changed';
var StateMixin = require('./mixins/stateMixin');

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

  this.on(STORE_CHANGED_EVENT, callback);

  return {
    dispose: _.bind(function () {
      this.removeListener(STORE_CHANGED_EVENT, callback);
    }, this)
  };
}

function getStores() {
  if (!this.__stores) {
    this.__stores = [];
  }

  return this.__stores;
}

function createContext(req) {
  return this.container.createContext(req);
}

function createStore(options) {
  var store = this.container.registerStore(options);

  store.addChangeListener(_.bind(onStoreChanged, this));
  this.getStores().push(store);

  return store;
}

function onStoreChanged() {
  var args = _.toArray(arguments);

  args.unshift(STORE_CHANGED_EVENT);

  this.emit.apply(this, args);
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