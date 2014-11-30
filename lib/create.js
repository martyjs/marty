var Store = require('./store');
var HttpAPI = require('./httpAPI');
var constants = require('./constants');
var StateMixin = require('./mixins/stateMixin');
var ActionCreators = require('./actionCreators');

module.exports = {
  createStore: createStore,
  createHttpAPI: createHttpAPI,
  createHTTPAPI: createHttpAPI, // For those who really care about correct casing
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createActionCreators: createActionCreators
};

function createStore(options) {
  return new Store(defaults(this, options));
}

function createHttpAPI(options) {
  return new HttpAPI(defaults(this, options));
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

function defaults(marty, options) {
  if (!options.dispatcher) {
    options.dispatcher = marty.dispatcher;
  }

  return options;
}