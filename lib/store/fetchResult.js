var when = require('./when');
var NotFoundError = require('../../errors/notFound');

module.exports = {
  done: done,
  failed: failed,
  pending: pending,
  notFound: notFound
};

function pending(id, store) {
  return fetchResult({
    id: id,
    pending: true,
    status: 'PENDING'
  }, store);
}

function failed(error, id, store) {
  return fetchResult({
    id: id,
    error: error,
    failed: true,
    status: 'FAILED'
  }, store);
}

function done(result, id, store) {
  return fetchResult({
    id: id,
    done: true,
    status: 'DONE',
    result: result
  }, store);
}

function notFound(id, store) {
  return failed(new NotFoundError(), id, store);
}

function fetchResult(result, store) {
  result.when = when;
  result.toPromise = toPromise;
  result._isFetchResult = true;

  if (store) {
    result.store = store.displayName || store.id;
  }

  return result;

  function toPromise() {
    return new Promise(function (resolve, reject) {
      var listener;

      if (!tryResolveFetch()) {
         listener = store.addChangeListener(tryResolveFetch);
      }

      function tryResolveFetch() {
        var fetch = store.getFetch(result.id);

        if (fetch.done) {
          resolve(fetch.result);
        } else if (fetch.failed) {
          reject(fetch.error);
        } else {
          return false;
        }

        if (listener) {
          listener.dispose();
        }

        return true;
      }
    });
  }
}