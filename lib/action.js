var _ = require('./utils/tinydash');

function Action(type, args, source) {
  var rollbackHandlers = [];

  this.type = type;
  this.source = source;
  this.arguments = args;

  this.toJSON = toJSON;
  this.toString = toString;
  this.rollback = rollback;
  this.addRollbackHandler = addRollbackHandler;

  function toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  function toJSON() {
    return {
      type: this.type,
      source: this.source,
      arguments: this.arguments
    };
  }

  function rollback() {
    _.each(rollbackHandlers, function (rollback) {
      rollback();
    });
  }

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = Action;