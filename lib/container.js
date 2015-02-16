var _ = require('underscore');
var log = require('./logger');
var Store = require('./store');
var Context = require('./context');
var classId = require('./utils/classId');
var StateSource = require('./stateSource');
var Environment = require('./environment');
var ActionCreators = require('./actionCreators');

var FUNCTIONS_TO_NOT_WRAP = ['fetch'];

function Container() {
  this.types = {};
  this.factories = {
    Store: Store,
    default: _.clone,
    StateSource: StateSource,
    ActionCreators: ActionCreators,
  };
  this.resolvers = {};
}

Container.prototype = {
  dispose: function () {
    this.types = {};
  },
  createContext: function (req) {
    return new Context(this, req);
  },
  get: function (type, clazz) {
    return (this.types[type] || {})[clazz];
  },
  getResolver: function (type, clazz) {
    return (this.resolvers[type] || {})[clazz];
  },
  getAllResolvers: function (type) {
    return _.values(this.resolvers[type] || {});
  },
  getAll: function (type) {
    return _.values(this.types[type] || {});
  },
  register: function (type, clazz) {
    if (!this.types[type]) {
      this.types[type] = {};
    }

    var id = classId(clazz, type);

    if (!id) {
      throw CannotRegisterClassError(clazz, type);
    }

    this.types[type][id] = clazz;

    if (!this.resolvers[type]) {
      this.resolvers[type] = {};
    }

    var resolver = this.createResolver(type, id);
    this.resolvers[type][id] = resolver;
    return resolver;
  },
  resolve: function (type, id, defaults) {
    var clazz = (this.types[type] || {})[id];

    if (!clazz) {
      throw CannotFindTypeWithId(type, id);
    }

    var factory = this.factories[type] || this.factories.default;

    return factory(_.extend(clazz, defaults));
  },
  createResolver: function (type, id) {
    var instance = this.resolve(type, id);
    var resolver = typeResolver(type, id);

    resolver.__resolver = true;

    _.extend(resolver, instance);
    _.each(Object.getOwnPropertyNames(instance), addProperty);

    if (Environment.isServer) {
      _.each(_.functions(resolver), wrapResolverFunctions);
    }

    return resolver;

    function wrapResolverFunctions(functionName) {
      if (FUNCTIONS_TO_NOT_WRAP.indexOf(functionName) !== -1) {
        return;
      }

      var originalFunc = resolver[functionName];

      resolver[functionName] = function () {
        if (Environment.isServer) {
          var type = resolver.__type;
          var displayName = resolver.displayName || resolver.id;
          var warningMessage = 'Warning: You are calling `' + functionName + '` on the static instance of the ' +
              type + ' \'' + displayName + '\'. You should resolve the instance for the current context';

          log.warn(warningMessage);
        }

        return originalFunc.apply(resolver, arguments);
      };
    }

    function addProperty(property) {
      Object.defineProperty(
        resolver,
        property,
        Object.getOwnPropertyDescriptor(instance, property)
      );
    }
  }
};

addTypeHelpers('Store');
addTypeHelpers('StateSource');
addTypeHelpers('ActionCreators');

module.exports = Container;

function addTypeHelpers(type) {
  var proto = Container.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== 's') {
    pluralType += 's';
  }

  proto['get' + type] = _.partial(proto.get, type);
  proto['resolve' + type] = _.partial(proto.resolve, type);
  proto['getAll' + pluralType] = _.partial(proto.get, type);
  proto['register' + type] = _.partial(proto.register, type);
  proto['get' + type + 'Resolver'] = _.partial(proto.getResolver, type);
  proto['create' + type + 'Resolver'] = _.partial(proto.createResolver, type);
  proto['getAll' + type + 'Resolvers'] = _.partial(proto.getAllResolvers, type);
}

function typeResolver(type, id) {
  var resolver = function (obj) {
    var context = getContext(obj);

    if (context) {
      return context.resolve(type, id);
    }

    return resolver;
  };

  return resolver;

  function getContext(obj) {
    if (!obj) {
      return;
    }

    if (obj instanceof Context) {
      return obj;
    }

    if (obj.context instanceof Context) {
      return obj.context;
    }

    if (obj.__context instanceof Context) {
      return obj.__context;
    }
  }
}

function CannotFindTypeWithId(type, id) {
  return new Error('Could not find ' + type + ' with Id ' + id);
}

function CannotRegisterClassError(clazz, type) {
  var message = 'Cannot register ';

  if (clazz && clazz.displayName) {
    message += clazz.displayName + ' ';
  }

  return new Error(message + type + ' because it does not have an Id.');
}