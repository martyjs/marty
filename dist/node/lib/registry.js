"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("./utils/mindash");
var log = require("./logger");
var Store = require("./store");
var Queries = require("./queries");
var Context = require("./context");
var warnings = require("./warnings");
var classId = require("./utils/classId");
var Environment = require("./environment");
var StateSource = require("./stateSource");
var ActionCreators = require("./actionCreators");
var humanStrings = require("./utils/humanStrings");

var FUNCTIONS_TO_NOT_WRAP = ["fetch"];

var Registry = (function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.types = {};
    this.defaults = {};
  }

  _createClass(Registry, {
    dispose: {
      value: function dispose() {
        this.types = {};
      }
    },
    createContext: {
      value: function createContext() {
        return new Context(this);
      }
    },
    get: {
      value: function get(type, id) {
        return (this.types[type] || {})[id];
      }
    },
    getAll: {
      value: function getAll(type) {
        return _.values(this.types[type] || {});
      }
    },
    getDefault: {
      value: function getDefault(type, id) {
        return this.defaults[type][id];
      }
    },
    getAllDefaults: {
      value: function getAllDefaults(type) {
        return _.values(this.defaults[type]);
      }
    },
    register: {
      value: function register(clazz) {
        var defaultInstance = new clazz({});
        var type = classType(defaultInstance);

        defaultInstance.__isDefaultInstance = true;

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
        defaultInstance.id = defaultInstance.id || id;
        defaultInstance.type = clazz.type = type;

        this.types[type][id] = clazz;

        if (Environment.isServer) {
          _.each(_.functions(defaultInstance), wrapResolverFunctions, defaultInstance);
        }

        this.defaults[type][id] = defaultInstance;

        return defaultInstance;
      }
    },
    resolve: {
      value: function resolve(type, id, options) {
        var clazz = (this.types[type] || {})[id];

        if (!clazz) {
          throw CannotFindTypeWithId(type, id);
        }

        return new clazz(options);
      }
    }
  });

  return Registry;
})();

addTypeHelpers("Store");
addTypeHelpers("Queries");
addTypeHelpers("StateSource");
addTypeHelpers("ActionCreators");

module.exports = Registry;

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

  if (obj instanceof Queries) {
    return "Queries";
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
  var proto = Registry.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== "s") {
    pluralType += "s";
  }

  proto["get" + type] = partial(proto.get, type);
  proto["resolve" + type] = partial(proto.resolve, type);
  proto["getAll" + pluralType] = partial(proto.getAll, type);
  proto["getDefault" + type] = partial(proto.getDefault, type);
  proto["getAllDefault" + pluralType] = partial(proto.getAllDefaults, type);

  function partial(func, type) {
    return function () {
      var args = _.toArray(arguments);
      args.unshift(type);
      return func.apply(this, args);
    };
  }
}

function CannotFindTypeWithId(type, id) {
  return new Error("Could not find " + type + " with Id " + id);
}

function CannotRegisterClassError(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = "Cannot register the " + typeDisplayName;

  if (displayName) {
    warningPrefix += " '" + displayName + "'";
  }

  return new Error("" + warningPrefix + " because it does not have an Id");
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = "Cannot register the " + typeDisplayName;

  if (displayName) {
    warningPrefix += " '" + displayName + "'";
  }

  return new Error("" + warningPrefix + " because there is already a class with that Id.");
}