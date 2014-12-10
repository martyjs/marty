var when = require('./when');
var Statuses = require('../internalConstants').Statuses;

function StoreQueryResult(options) {
  this.when = when;

  Object.defineProperty(this, 'status', {
    get: function () {
      return options.status;
    }
  });

  Object.defineProperty(this, 'pending', {
    get: function () {
      return options.status === Statuses.PENDING;
    }
  });

  Object.defineProperty(this, 'done', {
    get: function () {
      return options.status === Statuses.DONE;
    }
  });

  Object.defineProperty(this, 'failed', {
    get: function () {
      return !!options.error;
    }
  });

  Object.defineProperty(this, 'error', {
    get: function () {
      return options.error;
    }
  });

  Object.defineProperty(this, 'result', {
    get: function () {
      return options.result;
    }
  });
}

module.exports = StoreQueryResult;