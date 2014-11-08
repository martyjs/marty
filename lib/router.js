var _ = require('lodash');

function Router(options) {
  _.extend(this, options);

  this.initialize.apply(this, arguments);
}

Router.prototype = {
  initialize: function () {
  }
};

module.exports = Router;