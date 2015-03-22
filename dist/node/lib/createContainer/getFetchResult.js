"use strict";

var log = require("../logger");
var _ = require("../utils/mindash");
var fetch = require("../store/fetchResult");

function getFetchResult(config) {
  var errors = {};
  var results = {};
  var isPending = false;
  var hasFailed = false;
  var fetches = invokeFetches(config);

  _.each(fetches, function (fetch, key) {
    if (fetch.done) {
      results[key] = fetch.result;
    } else if (fetch.pending) {
      isPending = true;
    } else if (fetch.failed) {
      hasFailed = true;
      errors[key] = fetch.error;
    }
  });

  if (hasFailed) {
    return fetch.failed(errors);
  }

  if (isPending) {
    return fetch.pending();
  }

  return fetch.done(results);
}

function invokeFetches(config) {
  var fetches = {};

  _.each(config.fetch, function (getResult, key) {
    if (!_.isFunction(getResult)) {
      log.warn("The fetch " + key + " was not a function and so ignoring");
    } else {
      var result = getResult.call(config);

      if (!result || !result._isFetchResult) {
        result = fetch.done(result);
      }

      fetches[key] = result;
    }
  });

  return fetches;
}

module.exports = getFetchResult;