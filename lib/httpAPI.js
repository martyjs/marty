var _ = require('./utils/tinydash');
var HttpMixin = require('./mixins/httpMixin');

function HttpAPI(options) {
  options || (options = {});

  _.extend(this, options);
}

_.extend(HttpAPI.prototype, HttpMixin);