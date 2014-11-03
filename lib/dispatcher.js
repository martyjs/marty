var _ = require('lodash');
var Dispatcher = require('flux').Dispatcher;

_.extend(Dispatcher.prototype, {
  handleServerAction: function (action) {
    var payload = {
      source: 'server',
      action: action
    };
    this.dispatch(payload);
  },

  handleViewAction: function (action) {
    var payload = {
      source: 'view',
      action: action
    };
    this.dispatch(payload);
  }
});

module.exports = Dispatcher;