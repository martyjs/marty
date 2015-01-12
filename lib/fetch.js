var when = require('./when');
var NotFoundError = require('../errors/notFound');

module.exports = {
  done: done,
  failed: failed,
  pending: pending,
  notFound: notFound
};

function pending() {
  return fetchResult({
    pending: true,
    status: 'PENDING'
  });
}

function failed(error) {
  return fetchResult({
    error: error,
    failed: true,
    status: 'FAILED'
  });
}

function done(result) {
  return fetchResult({
    done: true,
    status: 'DONE',
    result: result
  });
}

function notFound() {
  return failed(new NotFoundError());
}

function fetchResult(result) {
  result.when = when;
  result._isFetchResult = true;

  return result;
}