var Marty = require('../../index');
var Statuses = require('../internalConstants').Statuses;
var ActionConstants = require('../internalConstants').Actions;

var ActionsStore = Marty.createStore({
  name: 'Actions',
  handlers: {
    actionDone: ActionConstants.ACTION_DONE,
    actionError: ActionConstants.ACTION_ERROR,
    actionStarting: ActionConstants.ACTION_STARTING
  },
  getState: function () {
    return {};
  },
  actionStarting: function (action) {
    this.state[action.token] = {
      type: action.type,
      token: action.token,
      status: Statuses.pending,
      arguments: action.arguments
    };
    this.hasChanged(action.token);
  },
  actionError: function (actionToken, error) {
    var action = this.state[actionToken];

    if (action) {
      action.status = Statuses.error;
      action.error = error;
      action.done = true;
      this.hasChanged(actionToken);
    }
  },
  actionDone: function (actionToken) {
    var action = this.state[actionToken];

    if (action) {
      action.status = Statuses.done;
      action.done = true;
      this.hasChanged(actionToken);
    }
  },
  getAction: function (actionToken) {
    return this.state[actionToken];
  }
});

module.exports = ActionsStore;