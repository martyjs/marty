"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("underscore");
var uuid = require("./utils/uuid");
var Instances = require("./instances");
var Dispatcher = require("./dispatcher");

var Context = (function () {
  function Context(container, req) {
    var _this = this;

    _classCallCheck(this, Context);

    this.req = req;
    this.instances = {};
    this.id = uuid.type("Context");
    this.dispatcher = new Dispatcher();

    Instances.add(this);

    _.each((container || {}).types, function (classes, type) {
      var options = {
        context: _this,
        dispatcher: _this.dispatcher
      };

      _this.instances[type] = {};

      _.each(classes, function (clazz) {
        _this.instances[type][clazz.id] = container.resolve(type, clazz.id, options);
      });
    });
  }

  _prototypeProperties(Context, null, {
    fetchData: {
      value: function fetchData(cb) {
        var fetchFinished, result;
        var instance = getInstance(this);

        instance.fetchCount = 0;
        instance.deferredFetchFinished = deferred();
        fetchFinished = instance.deferredFetchFinished.promise;

        try {
          result = cb.call(context);
          fetchFinished = fetchFinished.then(function () {
            return result;
          });
        } catch (e) {
          instance.deferred.reject(e);

          return fetchFinished;
        }

        if (instance.fetchCount === 0) {
          instance.deferredFetchFinished.resolve();
        }

        return fetchFinished;
      },
      writable: true,
      configurable: true
    },
    fetchStarted: {
      value: function fetchStarted() {
        getInstance(this).fetchCount++;
      },
      writable: true,
      configurable: true
    },
    fetchFinished: {
      value: function fetchFinished() {
        var instance = getInstance(this);
        instance.fetchCount--;
        if (instance.fetchCount === 0) {
          instance.deferredFetchFinished.resolve();
        }
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    getAll: {
      value: function getAll(type) {
        return _.values(this.instances[type]);
      },
      writable: true,
      configurable: true
    },
    getAllStores: {
      value: function getAllStores() {
        return this.getAll("Stores");
      },
      writable: true,
      configurable: true
    },
    getAllStateSources: {
      value: function getAllStateSources() {
        return this.getAll("StateSources");
      },
      writable: true,
      configurable: true
    },
    getAllActionCreators: {
      value: function getAllActionCreators() {
        return this.getALl("ActionCreators");
      },
      writable: true,
      configurable: true
    }
  });

  return Context;
})();

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