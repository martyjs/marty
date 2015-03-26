var constants = require('./constants');
var StateMixin = require('./stateMixin');
var createContainer = require('./createContainer');
var createStoreClass = require('./store/createStoreClass');
var createQueriesClass = require('./queries/createQueriesClass');
var createStateSourceClass = require('./stateSource/createStateSourceClass');
var createActionCreatorsClass = require('./actionCreators/createActionCreatorsClass');
var getClassName = require('./utils/getClassName');

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
  var className = getClassName(clazz);

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

function createConstants(obj) {
  return constants(obj);
}

function createStateMixin(options) {
  return new StateMixin(options);
}

function createStore(properties) {
  var StoreClass = createStoreClass(properties);
  var defaultInstance = this.register(StoreClass);

  return defaultInstance;
}

function createActionCreators(properties) {
  var ActionCreatorsClass = createActionCreatorsClass(properties);
  var defaultInstance = this.register(ActionCreatorsClass);

  return defaultInstance;
}

function createQueries(properties) {
  var QueriesClass = createQueriesClass(properties);
  var defaultInstance = this.register(QueriesClass);

  return defaultInstance;
}

function createStateSource(properties) {
  var StateSourceClass = createStateSourceClass(properties);
  var defaultInstance = this.register(StateSourceClass);

  return defaultInstance;
}
