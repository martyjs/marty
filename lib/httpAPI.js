var _ = require('lodash');
var request = require('superagent');
var Diagnostics = require('./diagnostics');

function HttpAPI(options) {
  options || (options = {});

  _.extend(this, options);

  this.initialize.apply(this, arguments);
}

HttpAPI.prototype = {
  initialize: function () {
  },
  get: function (url) {
    return this.request('get', url);
  },
  post: function (url) {
    return this.request('post', url);
  },
  put: function (url) {
    return this.request('put', url);
  },
  request: function (method, url) {
    if (this.baseUrl) {
      url = this.baseUrl += url;
    }

    Diagnostics.trace.httpRequestMade(method, url);

    return request[method](url);
  }
};

module.exports = HttpAPI;