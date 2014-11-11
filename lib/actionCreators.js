var _ = require('lodash');
var Diagnostics = require('./diagnostics');
var traceFunctions = require('./diagnostics/traceFunctions');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, traceFunctions(options, 'ActionCreator', Diagnostics.trace));

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType, data) {
    var action = {
      actionType: actionType,
      data: data
    };

    Diagnostics.trace.actionCreated(action);

    options.dispatcher.dispatch();
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;