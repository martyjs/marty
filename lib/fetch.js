var NotFoundError = require('../errors/notFound');
var StatusConstants = require('../constants/status');

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

  return result;
}

function when(handlers) {
  handlers || (handlers = {});

  var status = this.status;
  var handler = handlers[status.toLowerCase()];

  if (!handler) {
    throw new Error('Could not find a ' + status + ' handler');
  }

  switch (status) {
    case StatusConstants.PENDING.toString():
      return handler.call(handlers);
    case StatusConstants.FAILED.toString():
      return handler.call(handlers, this.error);
    case StatusConstants.DONE.toString():
      return handler.call(handlers, this.result);
  }
}