var _ = require('lodash');
var Diagnostics = require('./index');

function traceFunctions(functions, functionType) {
  _.each(functions, function (func, name) {
    if (!_.isFunction(func)) {
      return;
    }

    functions[name] = function () {
      var dataFlow = Diagnostics.createDataFlow();
      var traceId = dataFlow['entered' + functionType](functions, name, _.toArray(arguments));
      var result = func.apply(functions, arguments);

      dataFlow['left' + functionType](traceId, result);

      return result;
    };
  });
  return functions;
}

module.exports = traceFunctions;