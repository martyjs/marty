"use strict";

var _ = require("../utils/mindash");
var Instances = require("../instances");

function handleAction(action) {
  Instances.get(this).validateHandlers();

  var store = this;
  var handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        var rollbackHandler;

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