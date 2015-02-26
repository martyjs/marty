var _ = require('underscore');
var log = require('./logger');
var Store = require('./store');
var Context = require('./context');
var warnings = require('./warnings');
var classId = require('./utils/classId');
var Environment = require('./environment');
var StateSource = require('./stateSource');
var ActionCreators = require('./actionCreators');

var FUNCTIONS_TO_NOT_WRAP = ['fetch'];

class Container {
  constructor() {
    this.types = {};
    this.defaults = {};
  }

  dispose() {
    this.types = {};
  }

  createContext(req) {
    return new Context(this, req);
  }

  get(type, clazz) {
    return (this.types[type] || {})[clazz];
  }

  getAll(type) {
    return _.values(this.types[type] || {});
  }

  getDefault(type, id) {
    return this.defaults[type][id];
  }

  getAllDefaults(type) {
    return _.values(this.defaults[type]);
  }

  register(clazz) {
    var defaultInstance = new clazz();
    var type = classType(defaultInstance);

    if (!this.types[type]) {
      this.types[type] = {};
    }

    if (!this.defaults[type]) {
      this.defaults[type] = {};
    }

    var id = classId(clazz, type);

    if (!id) {
      throw CannotRegisterClassError(clazz, type);
    }

    if (this.types[type][id]) {
      throw ClassAlreadyRegisteredWithId(clazz, type);
    }

    clazz.id = id;
    clazz.type = type;

    this.types[type][id] = clazz;

    if (Environment.isServer) {
      _.each(_.functions(defaultInstance), wrapResolverFunctions, defaultInstance);
    }

    this.defaults[type][id] = defaultInstance;

    return defaultInstance;
  }

  resolve(type, id, options) {
    var clazz = (this.types[type] || {})[id];

    if (!clazz) {
      throw CannotFindTypeWithId(type, id);
    }

    return new clazz(options);
  }
}


addTypeHelpers('Store');
addTypeHelpers('StateSource');
addTypeHelpers('ActionCreators');

module.exports = Container;

function classType(obj) {
  if (obj instanceof Store) {
    return 'Store';
  }

  if (obj instanceof ActionCreators) {
    return 'ActionCreators';
  }

  if (obj instanceof StateSource) {
    return 'StateSource';
  }

  throw new Error('Unknown type');
}

function wrapResolverFunctions(functionName) {
  if (FUNCTIONS_TO_NOT_WRAP.indexOf(functionName) !== -1) {
    return;
  }

  var instance = this;
  var originalFunc = instance[functionName];

  instance[functionName] = function () {
    if (warnings.callingResolverOnServer && Environment.isServer) {
      var type = instance.__type;
      var displayName = instance.displayName || instance.id;
      var warningMessage =
        `Warning: You are calling \`${functionName}\` on the static instance of the ${type} ` +
        `'${displayName}'. You should resolve the instance for the current context`;

      log.warn(warningMessage);
    }

    return originalFunc.apply(instance, arguments);
  };
}


function addTypeHelpers(type) {
  var proto = Container.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== 's') {
    pluralType += 's';
  }

  proto['get' + type] = _.partial(proto.get, type);
  proto['resolve' + type] = _.partial(proto.resolve, type);
  proto['getAll' + pluralType] = _.partial(proto.getAll, type);
  proto['getDefault' + type] = _.partial(proto.getDefault, type);
  proto['getAllDefault' + pluralType] = _.partial(proto.getAllDefaults, type);
}

function CannotFindTypeWithId(type, id) {
  return new Error(`Could not find ${type} with Id ${id}`);
}

function CannotRegisterClassError(clazz, type) {
  var message = 'Cannot register ';

  if (clazz && clazz.displayName) {
    message += clazz.displayName + ' ';
  }

  return new Error(`${message} ${type} because it does not have an Id.`);
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  var message = 'Cannot register ';

  if (clazz && clazz.displayName) {
    message += clazz.displayName + ' ';
  }

  return new Error(`${message} ${type} because there is already a class with that Id.`);
}