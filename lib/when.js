var _ = require('underscore');
var StatusConstants = require('../constants/status');

when.all = all;
when.join = join;

function when(handlers) {
  handlers || (handlers = {});

  var handler = handlers[this.status.toLowerCase()];

  if (!handler) {
    throw new Error('Could not find a ' + this.status + ' handler');
  }

  switch (this.status) {
    case StatusConstants.PENDING.toString():
      return handler.call(handlers);
    case StatusConstants.FAILED.toString():
      return handler.call(handlers, this.error);
    case StatusConstants.DONE.toString():
      return handler.call(handlers, this.result);
    default:
      throw new Error('Unknown fetch result status');
  }
}

function join(/* fetchResults, handlers */) {
  return all(_.initial(arguments), _.last(arguments));
}

function all(fetchResults, handlers) {
  if (!fetchResults || !handlers) {
    throw new Error('No fetch results or handlers specified');
  }

  if (!_.isArray(fetchResults) || _.any(fetchResults, notFetchResult)) {
    throw new Error('Must specify a set of fetch results');
  }

  var context = {
    result: results(fetchResults),
    error: firstError(fetchResults),
    status: aggregateStatus(fetchResults)
  };

  return when.call(context, handlers);
}

function results(fetchResults) {
  return fetchResults.map(function (result) {
    return result.result;
  });
}

function firstError(fetchResults) {
  var failedResult = _.find(fetchResults, {
    status: StatusConstants.FAILED.toString()
  });

  if (failedResult) {
    return failedResult.error;
  }
}

function notFetchResult(result) {
  return !result._isFetchResult;
}

function aggregateStatus(fetchResults) {
  for (var i = fetchResults.length - 1; i >= 0; i--) {
    var status = fetchResults[i].status;

    if (status === StatusConstants.FAILED.toString() ||
        status === StatusConstants.PENDING.toString()) {
      return status;
    }
  }

  return StatusConstants.DONE.toString();
}

module.exports = when;