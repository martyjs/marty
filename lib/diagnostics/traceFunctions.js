var _ = require('lodash');

function traceFunctions(functions, functionType, tracer) {
  _.each(functions, function (func, name) {
    if (!_.isFunction(func)) {
      return;
    }

    functions[name] = function () {
      var traceId = tracer['entered' + functionType](functions, name, _.toArray(arguments));
      var result = func.apply(functions, arguments);

      tracer['left' + functionType](traceId, result);

      return result;
    };
  });
  return functions;
}

module.exports = traceFunctions;