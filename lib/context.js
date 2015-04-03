var _ = require('marty-core/lib/utils/mindash');
var uuid = require('marty-core/lib/utils/uuid');
var Instances = require('./instances');
var timeout = require('marty-core/lib/utils/timeout');
var Dispatcher = require('./dispatcher');
var deferred = require('marty-core/lib/utils/deferred');
var FetchDiagnostics = require('./fetchDiagnostics');

var DEFAULT_TIMEOUT = 1000;

class Context {
  constructor(registry) {
    this.instances = {};
    this.__isContext = true;
    this.id = uuid.type('Context');
    this.dispatcher = new Dispatcher();

    Instances.add(this);

    _.each((registry || {}).types, (classes, type) => {
      var options = {
        context: this,
        dispatcher: this.dispatcher
      };

      this.instances[type] = {};

      _.each(classes, (clazz) => {
        this.instances[type][clazz.id] = registry.resolve(
          type,
          clazz.id,
          options
        );
      });
    });
  }

  fetch(cb, options) {
    var fetchDone;
    var instance = getInstance(this);

    options = _.defaults(options || {}, {
      timeout: DEFAULT_TIMEOUT
    });

    instance.deferredFetchDone = deferred();
    instance.diagnostics = new FetchDiagnostics();
    fetchDone = instance.deferredFetchDone.promise;

    try {
      cb.call(this);
    } catch (e) {
      instance.deferredFetchDone.reject(e);

      return fetchDone;
    }

    if (!instance.diagnostics.hasPendingFetches) {
      instance.deferredFetchDone.resolve();
    }

    return Promise.race([fetchDone, timeout(options.timeout)]).then(function () {
      return instance.diagnostics.toJSON();
    });
  }

  fetchStarted(storeId, fetchId) {
    var diagnostics = getInstance(this).diagnostics;

    diagnostics.fetchStarted(storeId, fetchId);
  }

  fetchDone(storeId, fetchId, status, options) {
    var instance = getInstance(this);
    var diagnostics = instance.diagnostics;

    diagnostics.fetchDone(storeId, fetchId, status, options);

    if (!diagnostics.hasPendingFetches) {
      instance.deferredFetchDone.resolve();
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
