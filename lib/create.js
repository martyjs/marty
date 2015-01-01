var Store = require('./store');
var Repository = require('./repository');
var constants = require('./constants');
var Dispatcher = require('./dispatcher');
var StateMixin = require('./mixins/stateMixin');
var ActionCreators = require('./actionCreators');
var stores = [];

module.exports = {
  getStores: getStores,
  createStore: createStore,
  createRepository: createRepository,
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createActionCreators: createActionCreators
};

function getStores() {
  return stores;
}

function createStore(options) {
  var store = new Store(defaults(this, options));
  stores.push(store);
  return store;
}

function createConstants(obj) {
  return constants(obj);
}

function createActionCreators(options) {
  return new ActionCreators(defaults(this, options));
}

function createStateMixin(options) {
  return new StateMixin(defaults(this, options));
}

function createRepository(options) {
  return new Repository(defaults(this, options));
}

function defaults(marty, options) {
  options || (options = {});

  if (!options.dispatcher) {
    options.dispatcher = Dispatcher.getCurrent();
  }

  return options;
}