var _ = require('../utils/tinydash');
var http = {
  request: require('reqwest')
};

var HttpMixin = {
  get: function (options) {
    return this.request(requestOptions('GET', options));
  },
  put: function (options) {
    return this.request(requestOptions('PUT', options));
  },
  post: function (options) {
    return this.request(requestOptions('POST', options));
  },
  delete: function (options) {
    return this.request(requestOptions('DELETE', options));
  },
  request: function (options) {
    return http.request(options);
  }
};

function requestOptions(method, options) {
  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  options.method = method;
  options.type || (options.type = 'json');
  options.contentType || (options.contentType = 'application/json');

  // if (options.contentType === 'application/json') {
  //   options.processData = false;
  //   options.data = JSON.stringify(options.data);
  // }

  if (this.baseUrl) {
    var separator = '';
    var firstCharOfUrl = options.url[0];
    var lastCharOfBaseUrl = this.baseUrl[this.baseUrl.length - 1];

    // Do some text wrangling to make sure concatenation of base url
    // stupid people (i.e. me)
    if (lastCharOfBaseUrl !== '/' && firstCharOfUrl !== '/') {
      separator = '/';
    } else if (lastCharOfBaseUrl === '/' && firstCharOfUrl === '/') {
      options.url = options.url.substring(1);
    }

    options.url = this.baseUrl + separator + options.url;
  }

  console.log(options);

  return options;
}

module.exports = HttpMixin;