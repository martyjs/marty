var currentContext = null;
var _ = require('underscore');
var uuid = require('./utils/uuid');
var Instances = require('./instances');
var Dispatcher = require('./dispatcher');

class Context {
  constructor(container, req) {
    this.req = req;
    this.instances = {};
    this.id = uuid.type('Context');
    this.dispatcher = new Dispatcher();

    Instances.add(this);

    _.each(container.types, (classes, type) => {
      var options = {
        context: this,
        dispatcher: this.dispatcher
      };

      this.instances[type] = {};

      _.each(classes, (clazz) => {
        this.instances[type][clazz.id] = container.resolve(
          type,
          clazz.id,
          options
        );
      });
    });
  }

  renderInContext(cb, context) {
    var fetchFinished, result;
    var instance = getInstance(this);

    if (currentContext) {
      throw new Error('Another context is in use');
    }

    instance.fetchCount = 0;
    instance.deferredFetchFinished = deferred();
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

  fetchStarted() {
    getInstance(this).fetchCount++;
  }

  fetchFinished() {
    var instance = getInstance(this);
    instance.fetchCount--;
    if (instance.fetchCount === 0) {
      instance.deferredFetchFinished.resolve();
    }
  }

  dispose() {
    Instances.dispose(this);

    this.instances = null;
    this.dispatcher = null;
  }

  resolve(obj) {
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
  }

  getAll(type) {
    return _.values(this.instances[type]);
  }

  static getCurrent() {
    return currentContext;
  }
}

addTypeHelpers('Store');
addTypeHelpers('StateSource');
addTypeHelpers('ActionCreators');

module.exports = Context;

function getInstance(context) {
  return Instances.get(context);
}

function addTypeHelpers(type) {
  var proto = Context.prototype;
  var pluralType = type;

  if (pluralType[pluralType.length - 1] !== 's') {
    pluralType += 's';
  }

  proto['getAll' + pluralType] = _.partial(proto.getAll, type);
}

function deferred() {
  var result = {};
  result.promise = new Promise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}