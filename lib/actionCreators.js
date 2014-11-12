var _ = require('lodash');
var HttpAPI = require('./httpAPI');
var Diagnostics = require('./diagnostics');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(options));

  this.initialize.apply(this, arguments);

  function dispatch(actionType, data) {
    var action = {
      actionType: actionType,
      data: data
    };

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

  function traceFunctions(functions, functionType) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var dataFlow = HttpAPI.currentDataFlow || Diagnostics.createDataFlow();
        var functionCallOptions = {
          name: name,
          arguments: arguments,
          context: { type: 'ActionCreator', id: options.name }
        };

        return dataFlow.startFunctionCall(functionCallOptions, function () {
          return func.apply(functions, arguments);
        });
      };
    });
    return functions;
  }

}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;