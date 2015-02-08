var _ = require('underscore');
var Store = require('./store');
var Context = require('./context');
var classId = require('./utils/classId');
var StateSource = require('./stateSource');
var ActionCreators = require('./actionCreators');


function Container() {
  this.types = {};
  this.factories = {
    Store: Store,
    default: _.clone,
    StateSource: StateSource,
    ActionCreators: ActionCreators,
  };
}

Container.prototype = {
  dispose: function () {
    this.types = {};
  },
  createContext: function () {
    return new Context(this);
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

    return this.createResolver(type, id);
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

    _.extend(resolver, instance);
    _.each(Object.getOwnPropertyNames(instance), addProperty);

    return resolver;

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

  proto['resolve' +  type] = _.partial(proto.resolve, type);
  proto['register' +  type] = _.partial(proto.register, type);
  proto['create' +  type + 'Resolver'] = _.partial(proto.createResolver, type);
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