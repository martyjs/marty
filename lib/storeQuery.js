var CHANGE_EVENT = 'changed';
var _ = require('./utils/tinydash');
var constants = require('./constants');
var NotFoundError = require('./errors/notFound');
var EventEmitter = require('events').EventEmitter;
var statuses = constants(['pending', 'error', 'done']);

function StoreQuery(store, localQuery, remoteQuery) {
  var error, result;
  var emitter = new EventEmitter();
  var status = statuses.pending;

  this.addChangeListener = addChangeListener;

  Object.defineProperty(this, 'status', {
    get: function () {
      return status;
    }
  });

  Object.defineProperty(this, 'done', {
    get: function () {
      return isDone(status);
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
    result = remoteQuery.call(store);
  } catch (err) {
    reject(err);
  }

  if (isDone()) {
    return;
  }

  if (isUndefined(result)) {
    notFound();
  } else {
    if (isPromise(result)) {
      result.catch(reject).then(function () {
        resolve(localQuery());

        if (!isDone()) {
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
      setStatus(statuses.done);
    }
  }

  function reject(err) {
    error = err;
    setStatus(statuses.error);
  }

  function isPromise(obj) {
    return _.isFunction(obj.then);
  }

  function isDone() {
    return status === statuses.error || status === statuses.done;
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