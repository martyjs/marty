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

    _.each((container || {}).types, (classes, type) => {
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

  fetchData(cb) {
    var result;
    var fetchFinished;
    var instance = getInstance(this);

    instance.fetchCount = 0;
    instance.deferredFetchFinished = deferred();
    fetchFinished = instance.deferredFetchFinished.promise;

    try {
      result = cb.call(this);
      fetchFinished = fetchFinished.then(function () {
        return result;
      });
    } catch (e) {
      instance.deferredFetchFinished.reject(e);

      return fetchFinished;
    }

    if (instance.fetchCount === 0) {
      instance.deferredFetchFinished.resolve();
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

    _.each(this.instances, (instances) => {
      _.each(instances, (instance) => {
        if (_.isFunction(instance.dispose)) {
          instance.dispose();
        }
      });
    });

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
      throw new Error(`Context does not have any instances of ${type}`);
    }

    if (!this.instances[type][id]) {
      throw new Error(`Context does not have an instance of the ${type} id`);
    }

    return this.instances[type][id];
  }

  getAll(type) {
    return _.values(this.instances[type]);
  }

  getAllStores() {
    return this.getAll('Store');
  }

  getAllStateSources() {
    return this.getAll('StateSource');
  }

  getAllActionCreators() {
    return this.getAll('ActionCreators');
  }

  getAllQueries() {
    return this.getAll('Queries');
  }
}

module.exports = Context;

function getInstance(context) {
  return Instances.get(context);
}

function deferred() {
  var result = {};
  result.promise = new Promise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}