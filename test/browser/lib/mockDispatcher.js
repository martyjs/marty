var _ = require('lodash-node');

function MockDispatcher() {
  this.dispatch = dispatch;
  this.dispatchedActions = [];
  this.getActionWithType = getActionWithType;

  function getActionWithType(actionType) {
    return _.find(this.dispatchedActions, function (action) {
      return action.type === actionType;
    });
  }

  function dispatch(action) {
    this.dispatchedActions.push(action);
  }
}

module.exports = MockDispatcher;