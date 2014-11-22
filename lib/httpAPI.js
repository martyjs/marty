var _ = require('./utils/tinydash');
var HttpMixin = require('./httpMixin');

function HttpAPI(options) {
  options || (options = {});

  _.extend(this, options);
}

_.extend(HttpAPI.prototype, HttpMixin);