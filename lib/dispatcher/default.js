var _ = require('lodash');
var Dispatcher = require('./index');

var DefaultDispatcher = _.extend({
  handleServerAction: function (action) {
    var payload = {
      source: 'server',
      actionType: action
    };
    this.dispatch(payload);
  },

  handleViewAction: function (action) {
    var payload = {
      source: 'view',
      actionType: action
    };
    this.dispatch(payload);
  }
}, Dispatcher.prototype);

module.exports = DefaultDispatcher;