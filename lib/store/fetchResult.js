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
  result._isFetchResult = true;

  if (store) {
    result.store = store.displayName || store.id;
  }

  return result;
}