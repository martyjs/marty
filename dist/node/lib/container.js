"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("underscore");
var log = require("./logger");
var Store = require("./store");
var Context = require("./context");
var warnings = require("./warnings");
var classId = require("./utils/classId");
var Environment = require("./environment");
var StateSource = require("./stateSource");
var ActionCreators = require("./actionCreators");

var FUNCTIONS_TO_NOT_WRAP = ["fetch"];

var Container = (function () {
  function Container() {
    _classCallCheck(this, Container);

    this.types = {};
    this.defaults = {};
  }

  _prototypeProperties(Container, null, {
    dispose: {
      value: function dispose() {
        this.types = {};
      },
      writable: true,
      configurable: true
    },
    createContext: {
      value: function createContext(req) {
        return new Context(this, req);
      },
      writable: true,
      configurable: true
    },
    get: {
      value: function get(type, clazz) {
        return (this.types[type] || {})[clazz];
      },
      writable: true,
      configurable: true
    },
    getAll: {
      value: function getAll(type) {
        return _.values(this.types[type] || {});
      },
      writable: true,
      configurable: true
    },
    getDefault: {
      value: function getDefault(type, id) {
        return this.defaults[type][id];
      },
      writable: true,
      configurable: true
    },
    getAllDefaults: {
      value: function getAllDefaults(type) {
        return _.values(this.defaults[type]);
      },
      writable: true,
      configurable: true
    },
    register: {
      value: function register(clazz) {
        var defaultInstance = new clazz({});
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
      },
      writable: true,
      configurable: true
    },
    resolve: {
      value: function resolve(type, id, options) {
        var clazz = (this.types[type] || {})[id];

        if (!clazz) {
          throw CannotFindTypeWithId(type, id);
        }

        return new clazz(options);
      },
      writable: true,
      configurable: true
    }
  });

  return Container;
})();

addTypeHelpers("Store");
addTypeHelpers("StateSource");
addTypeHelpers("ActionCreators");

module.exports = Container;

function classType(obj) {
  if (obj instanceof Store) {
    return "Store";
  }

  if (obj instanceof ActionCreators) {
    return "ActionCreators";
  }

  if (obj instanceof StateSource) {
    return "StateSource";
  }

  throw new Error("Unknown type");
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
      var warningMessage = "Warning: You are calling `" + functionName + "` on the static instance of the " + type + " " + ("'" + displayName + "'. You should resolve the instance for the current context");

      log.warn(warningMessage);
    }

    return originalFunc.apply(instance, arguments);
  };
}

function addTypeHelpers(type) {
  var proto = Container.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== "s") {
    pluralType += "s";
  }

  proto["get" + type] = _.partial(proto.get, type);
  proto["resolve" + type] = _.partial(proto.resolve, type);
  proto["getAll" + pluralType] = _.partial(proto.getAll, type);
  proto["getDefault" + type] = _.partial(proto.getDefault, type);
  proto["getAllDefault" + pluralType] = _.partial(proto.getAllDefaults, type);
}

function CannotFindTypeWithId(type, id) {
  return new Error("Could not find " + type + " with Id " + id);
}

function CannotRegisterClassError(clazz, type) {
  var message = "Cannot register ";

  if (clazz && clazz.displayName) {
    message += clazz.displayName + " ";
  }

  return new Error("" + message + " " + type + " because it does not have an Id.");
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  var message = "Cannot register ";

  if (clazz && clazz.displayName) {
    message += clazz.displayName + " ";
  }

  return new Error("" + message + " " + type + " because there is already a class with that Id.");
}