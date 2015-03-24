let constants = require('./constants');
let StateMixin = require('./stateMixin');
let createContainer = require('./createContainer');
let createStoreClass = require('./store/createStoreClass');
let createQueriesClass = require('./queries/createQueriesClass');
let createStateSourceClass = require('./stateSource/createStateSourceClass');
let createActionCreatorsClass = require('./actionCreators/createActionCreatorsClass');
let DEFAULT_CLASS_NAME = 'Class';

module.exports = {
  register: register,
  createStore: createStore,
  createQueries: createQueries,
  createContext: createContext,
  createContainer: createContainer,
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createStateSource: createStateSource,
  createActionCreators: createActionCreators,
};

function register(clazz, id) {
  let className = getClassName(clazz);

  if (!clazz.id) {
    clazz.id = id || className;
  }

  if (!clazz.displayName) {
    clazz.displayName = clazz.id;
  }

  return this.registry.register(clazz);
}

function createContext() {
  return this.registry.createContext();
}

function getClassName(clazz) {
  let funcNameRegex = /function (.{1,})\(/;
  let results = (funcNameRegex).exec(clazz.toString());
  let className = (results && results.length > 1) ? results[1] : '';

  return className === DEFAULT_CLASS_NAME ? null : className;
}

function createConstants(obj) {
  return constants(obj);
}

function createStateMixin(options) {
  return new StateMixin(options);
}

function createStore(properties) {
  let StoreClass = createStoreClass(properties);
  let defaultInstance = this.register(StoreClass);

  return defaultInstance;
}

function createActionCreators(properties) {
  let ActionCreatorsClass = createActionCreatorsClass(properties);
  let defaultInstance = this.register(ActionCreatorsClass);

  return defaultInstance;
}

function createQueries(properties) {
  let QueriesClass = createQueriesClass(properties);
  let defaultInstance = this.register(QueriesClass);

  return defaultInstance;
}

function createStateSource(properties) {
  let StateSourceClass = createStateSourceClass(properties);
  let defaultInstance = this.register(StateSourceClass);

  return defaultInstance;
}