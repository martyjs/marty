var _ = require('lodash');
var Diagnostics = require('./diagnostics');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, functions(this, options));

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType) {
    var dataFlow = this.__dataFlow;

    var action = {
      dataFlow: dataFlow,
      actionType: actionType,
      arguments: _.rest(arguments),
    };

    if (dataFlow) {
      dataFlow.payload = _.omit(action, 'dataFlow');
    }

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

  function traceFunctions(actionCreator, functions) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var context = this;
        var dataFlow = context.__dataFlow || Diagnostics.createDataFlow({
          instigator: {
            name: actionCreator.name,
            type: 'ActionCreator',
            action: name,
            arguments: arguments
          }
        });

        if (!context.__dataFlow) {
          context = _.extend({
            '__dataFlow': dataFlow
          }, actionCreator);
        }

        return func.apply(context, arguments);
      };
    });

    return functions;
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;