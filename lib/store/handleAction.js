let _ = require('../utils/mindash');
let Instances = require('../instances');

function handleAction(action) {
  Instances.get(this).validateHandlers();

  let store = this;
  let handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        let rollbackHandler;

        try {
          store.action = action;
          action.addStoreHandler(store, handlerName, predicate.toJSON());
          rollbackHandler = store[handlerName].apply(store, action.arguments);
        } finally {
          action.addRollbackHandler(rollbackHandler, store);
        }
      }
    });
  });
}

function getHandlerWithPredicates(actionPredicates, handler) {
  _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

  let predicates = _.map(actionPredicates, toFunc);

  return [handler, predicates];

  function toFunc(actionPredicate) {
    if (actionPredicate.isActionCreator) {
      actionPredicate = {
        type: actionPredicate.toString()
      };
    } else if (_.isString(actionPredicate)) {
      actionPredicate = {
        type: actionPredicate
      };
    }

    let func = _.matches(actionPredicate);

    func.toJSON = function () {
      return actionPredicate;
    };

    return func;
  }
}

module.exports = handleAction;