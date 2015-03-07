var log = require('../logger');
var _ = require('../utils/mindash');
var warnings = require('../warnings');
var Instances = require('../instances');
var fetchResult = require('./fetchResult');
var CompoundError = require('../../errors/compound');
var NotFoundError = require('../../errors/notFound');
var StatusConstants = require('../../constants/status');

function fetch(id, local, remote) {
  var store = this, instance = Instances.get(this);
  var options, result, error, cacheError, context = this.context;

  if (_.isObject(id)) {
    options = id;
  } else {
    options = {
      id: id,
      locally: local,
      remotely: remote
    };
  }

  _.defaults(options, {
    locally: _.noop,
    remotely: _.noop
  });

  if (!options || !options.id) {
    throw new Error('must specify an id');
  }

  result = dependencyResult(this, options);

  if (result) {
    return result;
  }

  cacheError = _.isUndefined(options.cacheError) || options.cacheError;

  if (cacheError) {
    error = instance.failedFetches[options.id];

    if (error) {
      return failed(error);
    }
  }

  if (instance.fetchInProgress[options.id]) {
    return fetchResult.pending(options.id, store);
  }

  if (context) {
    context.fetchStarted(store.id, options.id);
  }

  return tryAndGetLocally() || tryAndGetRemotely();

  function tryAndGetLocally(remoteCalled) {
    try {
      var result = options.locally.call(store);

      if (_.isUndefined(result)) {
        return;
      }

      if (_.isNull(result)) {
        return notFound();
      }

      if (!remoteCalled) {
        finished();
      }

      return fetchResult.done(result, options.id, store);
    } catch (error) {
      failed(error);

      return fetchResult.failed(error, options.id, store);
    }
  }

  function tryAndGetRemotely() {
    try {
      result = options.remotely.call(store);

      if (result) {
        if (_.isFunction(result.then)) {
          instance.fetchInProgress[options.id] = true;

          result.then(function () {
            instance.fetchHistory[options.id] = true;
            result = tryAndGetLocally(true);

            if (result) {
              finished();
              store.hasChanged();
            } else {
              notFound();
              store.hasChanged();
            }
          }).catch(function (error) {
            failed(error);
            store.hasChanged();
          });

          return fetchResult.pending(options.id, store);
        } else {
          instance.fetchHistory[options.id] = true;
          result = tryAndGetLocally(true);

          if (result) {
            return result;
          }
        }
      }

      if (warnings.promiseNotReturnedFromRemotely) {
        log.warn(promiseNotReturnedWarning());
      }

      return notFound();
    } catch (error) {
      return failed(error);
    }
  }

  function promiseNotReturnedWarning() {
    var inStore = '';
    if (store.displayName) {
      inStore = ' in ' + store.displayName;
    }

    return `The remote fetch for '${options.id}' ${inStore} ` +
      'did not return a promise and the state was ' +
      'not present after remotely finished executing. ' +
      'This might be because you forgot to return a promise.';
  }

  function finished() {
    instance.fetchHistory[options.id] = true;
    delete instance.fetchInProgress[options.id];

    if (context) {
      context.fetchFinished(store.id, options.id);
    }
  }

  function failed(error) {
    if (cacheError) {
      instance.failedFetches[options.id] = error;
    }

    finished();

    return fetchResult.failed(error, options.id, store);
  }

  function notFound() {
    return failed(new NotFoundError(), options.id, store);
  }
}

function dependencyResult(store, options) {
  if (options.dependsOn) {
    if (_.isArray(options.dependsOn)) {
      var pending = false;
      var dependencyErrors = [];
      for (var i = 0; i < options.dependsOn.length; i++) {
        var dependency = options.dependsOn[i];

        switch (dependency.status) {
          case StatusConstants.PENDING.toString():
            pending = true;
            break;
          case StatusConstants.FAILED.toString():
            dependencyErrors.push(dependency.error);
            break;
        }
      }

      if (dependencyErrors.length) {
        var error = new CompoundError(dependencyErrors);
        return fetchResult.failed(error, options.id, store);
      }

      if (pending) {
        return fetchResult.pending(options.id, store);
      }
    } else {
      if (!options.dependsOn.done) {
        return options.dependsOn;
      }
    }
  }
}

fetch.done = fetchResult.done;
fetch.failed = fetchResult.failed;
fetch.pending = fetchResult.pending;
fetch.notFound = fetchResult.notFound;

module.exports = fetch;