let _ = require('./utils/mindash');
let uuid = require('./utils/uuid');
let Instances = require('./instances');
let timeout = require('./utils/timeout');
let Dispatcher = require('./dispatcher');
let deferred = require('./utils/deferred');
let FetchDiagnostics = require('./fetchDiagnostics');

let DEFAULT_TIMEOUT = 1000;

class Context {
  constructor(registry) {
    this.instances = {};
    this.id = uuid.type('Context');
    this.dispatcher = new Dispatcher();

    Instances.add(this);

    _.each((registry || {}).types, (classes, type) => {
      let options = {
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
    let fetchDone;
    let instance = getInstance(this);

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
    let diagnostics = getInstance(this).diagnostics;

    diagnostics.fetchStarted(storeId, fetchId);
  }

  fetchDone(storeId, fetchId, status, options) {
    let instance = getInstance(this);
    let diagnostics = instance.diagnostics;

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

    let id = obj.constructor.id;
    let type = obj.constructor.type;

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
