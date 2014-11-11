var _ = require('lodash');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, options);

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType) {
    var args = _.rest(arguments);

    options.dispatcher.dispatch({
      actionType: actionType,
      arguments: args
    });
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;