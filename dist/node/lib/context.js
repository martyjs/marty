"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("./utils/mindash");
var uuid = require("./utils/uuid");
var Instances = require("./instances");
var timeout = require("./utils/timeout");
var Dispatcher = require("./dispatcher");
var deferred = require("./utils/deferred");
var FetchDiagnostics = require("./fetchDiagnostics");

var DEFAULT_TIMEOUT = 1000;

var Context = (function () {
  function Context(registry) {
    var _this = this;

    _classCallCheck(this, Context);

    this.instances = {};
    this.id = uuid.type("Context");
    this.dispatcher = new Dispatcher();

    Instances.add(this);

    _.each((registry || {}).types, function (classes, type) {
      var options = {
        context: _this,
        dispatcher: _this.dispatcher
      };

      _this.instances[type] = {};

      _.each(classes, function (clazz) {
        _this.instances[type][clazz.id] = registry.resolve(type, clazz.id, options);
      });
    });
  }

  _createClass(Context, {
    fetch: {
      value: function fetch(cb, options) {
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
    },
    fetchStarted: {
      value: function fetchStarted(storeId, fetchId) {
        var diagnostics = getInstance(this).diagnostics;

        diagnostics.fetchStarted(storeId, fetchId);
      }
    },
    fetchDone: {
      value: function fetchDone(storeId, fetchId, status, options) {
        var instance = getInstance(this);
        var diagnostics = instance.diagnostics;

        diagnostics.fetchDone(storeId, fetchId, status, options);

        if (!diagnostics.hasPendingFetches) {
          instance.deferredFetchDone.resolve();
        }
      }
    },
    dispose: {
      value: function dispose() {
        Instances.dispose(this);

        _.each(this.instances, function (instances) {
          _.each(instances, function (instance) {
            if (_.isFunction(instance.dispose)) {
              instance.dispose();
            }
          });
        });

        this.instances = null;
        this.dispatcher = null;
      }
    },
    resolve: {
      value: function resolve(obj) {
        if (!obj.constructor) {
          throw new Error("Cannot resolve object");
        }

        var id = obj.constructor.id;
        var type = obj.constructor.type;

        if (!this.instances[type]) {
          throw new Error("Context does not have any instances of " + type);
        }

        if (!this.instances[type][id]) {
          throw new Error("Context does not have an instance of the " + type + " id");
        }

        return this.instances[type][id];
      }
    },
    getAll: {
      value: function getAll(type) {
        return _.values(this.instances[type]);
      }
    },
    getAllStores: {
      value: function getAllStores() {
        return this.getAll("Store");
      }
    },
    getAllStateSources: {
      value: function getAllStateSources() {
        return this.getAll("StateSource");
      }
    },
    getAllActionCreators: {
      value: function getAllActionCreators() {
        return this.getAll("ActionCreators");
      }
    },
    getAllQueries: {
      value: function getAllQueries() {
        return this.getAll("Queries");
      }
    }
  });

  return Context;
})();

module.exports = Context;

function getInstance(context) {
  return Instances.get(context);
}