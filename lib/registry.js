let _ = require('./utils/mindash');
let log = require('./logger');
let Store = require('./store');
let Queries = require('./queries');
let Context = require('./context');
let warnings = require('./warnings');
let classId = require('./utils/classId');
let Environment = require('./environment');
let StateSource = require('./stateSource');
let ActionCreators = require('./actionCreators');
let humanStrings = require('./utils/humanStrings');

let FUNCTIONS_TO_NOT_WRAP = ['fetch'];

class Registry {
  constructor() {
    this.types = {};
    this.defaults = {};
  }

  dispose() {
    this.types = {};
  }

  createContext() {
    return new Context(this);
  }

  get(type, id) {
    return (this.types[type] || {})[id];
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
    let defaultInstance = new clazz({});
    let type = classType(defaultInstance);

    defaultInstance.__isDefaultInstance = true;

    if (!this.types[type]) {
      this.types[type] = {};
    }

    if (!this.defaults[type]) {
      this.defaults[type] = {};
    }

    let id = classId(clazz, type);

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
    let clazz = (this.types[type] || {})[id];

    if (!clazz) {
      throw CannotFindTypeWithId(type, id);
    }

    return new clazz(options);
  }
}


addTypeHelpers('Store');
addTypeHelpers('Queries');
addTypeHelpers('StateSource');
addTypeHelpers('ActionCreators');

module.exports = Registry;

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

  if (obj instanceof Queries) {
    return 'Queries';
  }

  throw new Error('Unknown type');
}

function wrapResolverFunctions(functionName) {
  if (FUNCTIONS_TO_NOT_WRAP.indexOf(functionName) !== -1) {
    return;
  }

  let instance = this;
  let originalFunc = instance[functionName];

  instance[functionName] = function () {
    if (warnings.callingResolverOnServer && Environment.isServer) {
      let type = instance.__type;
      let displayName = instance.displayName || instance.id;
      let warningMessage =
        `Warning: You are calling \`${functionName}\` on the static instance of the ${type} ` +
        `'${displayName}'. You should resolve the instance for the current context`;

      log.warn(warningMessage);
    }

    return originalFunc.apply(instance, arguments);
  };
}


function addTypeHelpers(type) {
  let proto = Registry.prototype;
  let pluralType = type;

  if (pluralType[pluralType.length - 1] !== 's') {
    pluralType += 's';
  }

  proto['get' + type] = partial(proto.get, type);
  proto['resolve' + type] = partial(proto.resolve, type);
  proto['getAll' + pluralType] = partial(proto.getAll, type);
  proto['getDefault' + type] = partial(proto.getDefault, type);
  proto['getAllDefault' + pluralType] = partial(proto.getAllDefaults, type);

  function partial(func, type) {
    return function () {
      let args = _.toArray(arguments);
      args.unshift(type);
      return func.apply(this, args);
    };
  }
}

function CannotFindTypeWithId(type, id) {
  return new Error(`Could not find ${type} with Id ${id}`);
}

function CannotRegisterClassError(clazz, type) {
  let displayName = clazz.displayName || clazz.id;
  let typeDisplayName = humanStrings[type] || type;
  let warningPrefix = `Cannot register the ${typeDisplayName}`;

  if (displayName) {
    warningPrefix += ` '${displayName}'`;
  }

  return new Error(`${warningPrefix} because it does not have an Id`);
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  let displayName = clazz.displayName || clazz.id;
  let typeDisplayName = humanStrings[type] || type;
  let warningPrefix = `Cannot register the ${typeDisplayName}`;

  if (displayName) {
    warningPrefix += ` '${displayName}'`;
  }

  return new Error(`${warningPrefix} because there is already a class with that Id.`);
}