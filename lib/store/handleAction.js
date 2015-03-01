var _ = require('underscore');
var log = require('../logger');
var Instances = require('../instances');
var ActionHandlerNotFoundError = require('../../errors/actionHandlerNotFound');

function handleAction(action) {
  Instances.get(this).validateHandlers();

  var store = this;
  var handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        var rollbackHandler, actionHandler;
        var handler = action.addStoreHandler(store, handlerName, predicate.toJSON());

        try {
          store.action = action;
          actionHandler = store[handlerName];

          if (actionHandler) {
            rollbackHandler = actionHandler.apply(store, action.arguments);
          } else {
            throw new ActionHandlerNotFoundError(handlerName, store);
          }
        } catch (e) {
          var type = action.type.toString();

          var errorMessage =
            `An error occured while trying to handle an '${type}' action in the action handler \`${handlerName}\``;

          var displayName = store.displayName || store.id;

          if (displayName) {
            errorMessage += ` within the store ${displayName}`;
          }

          log.error(errorMessage, e, action);

          handler.failed(e);
          throw e;
        } finally {
          store.action = null;

          action.addRollbackHandler(rollbackHandler, store);

          if (handler) {
            handler.dispose();
          }
        }
      }
    });
  });
}

function getHandlerWithPredicates(actionPredicates, handler) {
  _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

  var predicates = _.map(actionPredicates, toFunc);

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

    var func = _.matches(actionPredicate);

    func.toJSON = function () {
      return actionPredicate;
    };

    return func;
  }
}

module.exports = handleAction;