var currentContext = null;
var _ = require('underscore');
var uuid = require('./utils/uuid');
var Dispatcher = require('./dispatcher');

function Context(container, req) {
  var fetchCount, deferredFetchFinished;

  this.req = req;
  this.instances = {};
  this.id = uuid.generate();
  this.fetchStarted = fetchStarted;
  this.fetchFinished = fetchFinished;
  this.dispatcher = new Dispatcher();
  this.renderInContext = renderInContext;

  if (container) {
    _.each(container.types, createInstancesOfType, this);
  }

  function renderInContext(cb, context) {
    var fetchFinished, result;

    if (currentContext) {
      throw new Error('Another context is in use');
    }

    fetchCount = 0;
    deferredFetchFinished = deferred();
    fetchFinished = deferredFetchFinished.promise;

    try {
      currentContext = this;
      result = cb.call(context);
      fetchFinished = fetchFinished.then(function () {
        return result;
      });
    } finally {
      currentContext = null;
    }

    return fetchFinished;
  }

  function fetchStarted() {
    fetchCount++;
  }

  function fetchFinished() {
    fetchCount--;
    if (fetchCount === 0) {
      deferredFetchFinished.resolve();
    }
  }

  function createInstancesOfType(classes, type) {
    var options = {
      context: this,
      dispatcher: this.dispatcher
    };

    this.instances[type] = {};

    _.each(classes, function (clazz) {
      this.instances[type][clazz.id] = container.resolve(
        type,
        clazz.id,
        options
      );
    }, this);
  }
}

function deferred() {
  var result = {};
  result.promise = new Promise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

Context.getCurrent = function () {
  return currentContext;
};

Context.prototype = {
  dispose: function () {
    this.instances = null;
    this.dispatcher = null;
  },
  resolve: function (obj) {
    if (!obj.constructor) {
      throw new Error('Cannot resolve object');
    }

    var id = obj.constructor.id;
    var type = obj.constructor.type;

    if (!this.instances[type]) {
      throw new Error('Context does not have any instances of ' + type);
    }

    if (!this.instances[type][id]) {
      throw new Error('Context does not have an instance of the ' + type + ' ' + id);
    }

    return this.instances[type][id];
  },
  getAll: function (type) {
    return _.values(this.instances[type]);
  }
};

addTypeHelpers('Store');
addTypeHelpers('StateSource');
addTypeHelpers('ActionCreators');

module.exports = Context;

function addTypeHelpers(type) {
  var proto = Context.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== 's') {
    pluralType += 's';
  }

  proto['getAll' + pluralType] = _.partial(proto.getAll, type);
}