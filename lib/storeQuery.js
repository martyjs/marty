var CHANGE_EVENT = 'changed';
var _ = require('./utils/tinydash');
var constants = require('./constants');
var NotFoundError = require('./errors/notFound');
var EventEmitter = require('events').EventEmitter;
var statuses = constants(['in_progress', 'failed', 'successful']);

function StoreQuery(localQuery, remoteQuery) {
  var error, result;
  var emitter = new EventEmitter();
  var status = statuses.in_progress;

  this.addChangeListener = addChangeListener;

  Object.defineProperty(this, 'status', {
    get: function () {
      return status;
    }
  });

  Object.defineProperty(this, 'finished', {
    get: function () {
      return hasFinished(status);
    }
  });

  Object.defineProperty(this, 'error', {
    get: function () {
      return error;
    }
  });

  Object.defineProperty(this, 'result', {
    get: function () {
      return result;
    }
  });

  try {
    resolve(localQuery());
  } catch (err) {
    reject(err);
  }

  if (hasFinished()) {
    return;
  }

  try {
    result = remoteQuery();
  } catch (err) {
    reject(err);
  }

  if (isUndefined(result)) {
    notFound();
  } else {
    if (isPromise(result)) {
      result.catch(reject).then(function () {
        resolve(localQuery());

        if (!hasFinished()) {
          notFound();
        }
      });
    } else {
      resolve(result);
    }
  }

  function notFound() {
    reject(new NotFoundError());
  }

  function isUndefined(value) {
    return _.isUndefined(value) || _.isNull(value);
  }

  function resolve(data) {
    if (!isUndefined(data)) {
      result = data;
      setStatus(statuses.successful);
    }
  }

  function reject(err) {
    error = err;
    setStatus(statuses.failed);
  }

  function isPromise(obj) {
    return _.isFunction(obj.then);
  }

  function hasFinished() {
    return status === statuses.failed || status === statuses.successful;
  }

  function setStatus(newStatus) {
    status = newStatus;
    emitter.emit(CHANGE_EVENT, status, hasFinished());
  }

  function addChangeListener(callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: function () {
        emitter.removeListener(CHANGE_EVENT, callback);
      }
    };
  }
}

module.exports = StoreQuery;