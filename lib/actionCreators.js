var _ = require('lodash');
var trace = require('./diagnostics').trace;
var traceFunctions = require('./diagnostics/traceFunctions');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(options));

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType, data) {
    var action = {
      actionType: actionType,
      data: data
    };

    if (shouldTrace()) {
      trace.actionCreated(action);
    }

    options.dispatcher.dispatch(action);
  }

  function functions(options) {
    if (shouldTrace()) {
      return traceFunctions(options, 'ActionCreator', trace);
    }

    return options;
  }

  function shouldTrace() {
    return options.trace || _.isUndefined(options.trace);
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;