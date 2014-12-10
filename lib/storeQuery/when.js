var Statuses = require('../internalConstants').Statuses;

function when(handlers) {
  handlers || (handlers = {});

  var status = this.status;
  var handler = handlers[status.toLowerCase()];

  if (!handler) {
    throw new Error('Could not find a ' + status + ' handler');
  }

  switch (status) {
    case Statuses.PENDING:
      return handler();
    case Statuses.FAILED:
      return handler(this.error);
    case Statuses.DONE:
      return handler(this.result);
  }
}

module.exports = when;