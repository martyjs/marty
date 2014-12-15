var Store = require('../store');
var _ = require('../utils/tinydash');
var Statuses = require('../internalConstants').Statuses;
var ActionConstants = require('../internalConstants').Actions;

var ActionsStore = new Store({
  name: 'Actions',
  handlers: {
    actionDone: ActionConstants.ACTION_DONE,
    actionError: ActionConstants.ACTION_ERROR,
    actionStarting: ActionConstants.ACTION_STARTING
  },
  getInitialState: function () {
    return {};
  },
  actionStarting: function (action) {
    this.state[action.token] = {
      type: action.type,
      token: action.token,
      status: Statuses.PENDING,
      handlers: action.handlers,
      arguments: action.arguments
    };
    this.hasChanged(action.token);
  },
  actionError: function (actionToken, error) {
    var action = this.state[actionToken];

    if (action) {
      action.status = Statuses.FAILED;
      action.error = error;
      action.done = true;
      this.hasChanged(actionToken);
    }
  },
  actionDone: function (actionToken) {
    var action = this.state[actionToken];

    if (action) {
      action.status = Statuses.DONE;
      action.done = true;
      this.hasChanged(actionToken);
    }
  },
  getAll: function () {
    return _.values(this.state);
  },
  getAction: function (actionToken) {
    return this.state[actionToken];
  }
});

module.exports = ActionsStore;