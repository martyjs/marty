var _ = require('lodash');
var Http = require('./http');

function HttpAPI(options) {
  options = _.defaults(options, {
    http: new Http(this.baseUrl),
    initialize: function () { }
  });

  _.extend(this, options);

  this.initialize.apply(this, arguments);
}

module.exports = HttpAPI;