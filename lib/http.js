var request = require('superagent');

function Http(baseUrl) {
  this.baseUrl = baseUrl;
}

Http.prototype = {
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

    return request[method](url);
  }
};