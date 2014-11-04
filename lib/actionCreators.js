var _ = require('lodash');

function ActionCreators(options) {
  options || (options = {});

  _.extend(this, options);

  this.initialize.apply(this, arguments);
}

ActionCreators.prototype = {
  initialize: function () { }
};

module.exports = ActionCreators;