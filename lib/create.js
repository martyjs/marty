var StateMixin = require('./stateMixin');
var createContainer = require('./createContainer');
var createStateSourceClass = require('./stateSource/createStateSourceClass');
var getClassName = require('marty-core/lib/utils/getClassName');

module.exports = {
  register: register,
  createContext: createContext,
  createContainer: createContainer,
  createStateMixin: createStateMixin,
  createStateSource: createStateSource,
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

function createStateMixin(options) {
  return new StateMixin(options);
}

function createStateSource(properties) {
  var StateSourceClass = createStateSourceClass(properties);
  var defaultInstance = this.register(StateSourceClass);

  return defaultInstance;
}
