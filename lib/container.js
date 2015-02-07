var _ = require('underscore');
var Context = require('./context');
var classId = require('./utils/classId');
var ActionCreators = require('./actionCreators');

function Container() {
  this.types = {};
  this.factories = { default: _.clone };
  this.factories.ActionCreators = ActionCreators;
}

Container.prototype = {
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
  resolve: function (type, id) {
    var clazz = (this.types[type] || {})[id];

    if (!clazz) {
      throw CannotFindTypeWithId(type, id);
    }

    var factory = this.factories[type] || this.factories.default;

    return factory(clazz);
  },
  createResolver: function (type, id) {
    var resolver = typeResolver(type, id);

    _.extend(resolver, this.resolve(type, id));

    return resolver;
  }
};

addTypeHelpers('ActionCreators');

module.exports = Container;

function addTypeHelpers(type) {
  var proto = Container.prototype;

  proto['resolve' +  type] = _.partial(proto.resolve, type);
  proto['register' +  type] = _.partial(proto.register, type);
  proto['create' +  type + 'Resolver'] = _.partial(proto.createResolver, type);
}

function typeResolver(type, id) {
  return function (obj) {
    var context = getContext(obj);

    return context.resolve(type, id);
  };

  function getContext(obj) {
    if (!obj) {
      throw new Error('Context not defined.');
    }

    if (obj instanceof Context) {
      return obj;
    }

    if (obj.context instanceof Context) {
      return obj.context;
    }

    throw new Error('Could not resolve context');
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