var _ = require('lodash');
var HttpAPI = require('./httpAPI');
var Diagnostics = require('./diagnostics');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(this, options));

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType, data, dataFlow) {
    var action = {
      data: data,
      dataFlow: dataFlow,
      actionType: actionType
    };

    options.dispatcher.dispatch(action);
  }


  function functions(actionCreator, options) {
    if (shouldTrace()) {
      return traceFunctions(actionCreator, options, 'ActionCreator');
    }

    return options;
  }

  function shouldTrace() {
    return options.trace || _.isUndefined(options.trace);
  }

  function traceFunctions(actionCreator, functions, functionType) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var context = this;
        var dataFlow = context.__dataFlow || Diagnostics.createDataFlow();

        console.log('Context Id', context.id, context.__dataFlow);

        var functionCallOptions = {
          name: name,
          arguments: arguments,
          context: { type: 'ActionCreator', id: options.name }
        };

        return dataFlow.startFunctionCall(functionCallOptions, function () {
          if (!context.__dataFlow) {
            context = _.extend({
              id: _.uniqueId(),
              '__dataFlow': dataFlow
            }, actionCreator);
          }

          return func.apply(context, arguments);
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