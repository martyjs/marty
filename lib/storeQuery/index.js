var CHANGE_EVENT = 'changed';
var when = require('./when');
var _ = require('../utils/tinydash');
var NotFoundError = require('../errors/notFound');
var EventEmitter = require('events').EventEmitter;
var Statuses = require('../internalConstants').Statuses;

function StoreQuery(store, localQuery, remoteQuery) {
  var error, result, remoteResult;
  var emitter = new EventEmitter();
  var status = Statuses.PENDING;

  this.when = when;
  this.addChangeListener = addChangeListener;

  Object.defineProperty(this, 'status', {
    get: function () {
      return status;
    }
  });

  Object.defineProperty(this, 'pending', {
    get: function () {
      return status === Statuses.PENDING;
    }
  });

  Object.defineProperty(this, 'done', {
    get: function () {
      return status === Statuses.DONE;
    }
  });

  Object.defineProperty(this, 'failed', {
    get: function () {
      return !!error;
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
    resolve(localQuery.call(store));
  } catch (err) {
    reject(err);
  }

  if (isDone()) {
    return;
  }

  try {
    remoteResult = remoteQuery.call(store);
  } catch (err) {
    reject(err);
  }

  if (isDone()) {
    return;
  }

  if (remoteResult) {
    if (isPromise(remoteResult)) {
      remoteResult.then(nowTryAndGetLocally).catch(reject);
    } else {
      resolve(remoteResult);
    }
  } else {
    nowTryAndGetLocally();
  }

  function nowTryAndGetLocally() {
    resolve(localQuery.call(store));

    if (!isDone()) {
      notFound('Could not find result in local cache after remote query');
    }
  }

  function notFound(message) {
    reject(new NotFoundError(message));
  }

  function isUndefined(value) {
    return _.isUndefined(value) || _.isNull(value);
  }

  function resolve(data) {
    if (!isUndefined(data)) {
      result = data;
      setStatus(Statuses.DONE);
    }
  }

  function reject(err) {
    error = err;
    setStatus(Statuses.FAILED);
  }

  function isPromise(obj) {
    return _.isFunction(obj.then);
  }

  function isDone() {
    return status === Statuses.FAILED || status === Statuses.DONE;
  }

  function setStatus(newStatus) {
    status = newStatus;
    emitter.emit(CHANGE_EVENT, status, isDone());
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