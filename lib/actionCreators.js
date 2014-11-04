var _ = require('lodash');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, options);

  this.dispatch = dispatch;
  this.initialize.apply(this, arguments);

  function dispatch(actionType, data) {
    options.dispatcher.dispatch({
      actionType: actionType,
      data: data
    });
  }
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;