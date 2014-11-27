var _ = require('./utils/tinydash');
var diagnostics = require('./diagnostics');
var DispatchMixin = require('./mixins/dispatchMixin');

function ActionCreators(options) {
  options || (options = {});

  this.__dispatcher = getDispatcher(options);
  _.extend.apply(_, [this, functions(this, options), DispatchMixin].concat(options.mixins));

  function functions(actionCreator, options) {
    if (diagnostics.enabled) {
      return traceFunctions(actionCreator, options, 'ActionCreator');
    }

    return options;
  }

  function getDispatcher(options) {
    var dispatcher = options.dispatcher;
    delete options.dispatcher;
    return dispatcher;
  }

  function traceFunctions(actionCreator, functions) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return;
      }

      functions[name] = function () {
        var context = this;
        var creator = context.__creator || {
          action: name,
          type: 'ActionCreator',
          name: actionCreator.name,
          arguments: _.toArray(arguments)
        };

        if (!context.__creator) {
          context = _.extend({
            '__creator': creator
          }, actionCreator);
        }

        return func.apply(context, arguments);
      };
    });

    return functions;
  }

}

module.exports = ActionCreators;