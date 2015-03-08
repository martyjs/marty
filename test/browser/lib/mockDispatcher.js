var _ = require('lodash');
var ActionPayload = require('../../../lib/actionPayload');

function MockDispatcher() {
  this.id = 'MockDispatcher';

  this.register = _.noop;
  this.dispatch = dispatch;
  this.dispatchedActions = [];
  this.dispatchAction = dispatch;
  this.getActionWithType = getActionWithType;

  function getActionWithType(actionType) {
    return _.find(this.dispatchedActions, function (action) {
      return action.type === actionType;
    });
  }

  function dispatch(action) {
    this.dispatchedActions.push(new ActionPayload(action));
  }
}

module.exports = MockDispatcher;