var _ = require('./utils/mindash');
var Store = require('./store');
var constants = require('./constants');
var Dispatcher = require('./dispatcher');
var StateSource = require('./stateSource');
var StateMixin = require('./mixins/stateMixin');
var ActionCreators = require('./actionCreators');
var EventEmitter = require('events').EventEmitter;

var STORE_CHANGED_EVENT = 'store-changed';

var stores = [];
var emitter = new EventEmitter();

module.exports = {
  getStores: getStores,
  createStore: createStore,
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

function createStore(options) {
  var store = new Store(defaults(this, options));

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

function createActionCreators(options) {
  return new ActionCreators(defaults(this, options));
}

function createStateMixin(options) {
  return new StateMixin(defaults(this, options));
}

function createStateSource(options) {
  return new StateSource(defaults(this, options));
}

function defaults(marty, options) {
  options || (options = {});

  if (!options.dispatcher) {
    options.dispatcher = Dispatcher.getCurrent();
  }

  return options;
}