let _ = require('../utils/mindash');
let ActionHandlerNotFoundError = require('../errors/actionHandlerNotFound');
let ActionPredicateUndefinedError = require('../errors/actionPredicateUndefined');

function validateHandlers(store) {
  _.each(store.handlers, function (actionPredicate, handlerName) {
    let actionHandler = store[handlerName];

    if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
      throw new ActionHandlerNotFoundError(handlerName, store);
    }

    if (!actionPredicate) {
      throw new ActionPredicateUndefinedError(handlerName, store);
    }
  });
}

module.exports = validateHandlers;