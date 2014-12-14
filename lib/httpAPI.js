var _ = require('./utils/tinydash');
var http = {
  request: require('reqwest')
};

function HttpAPI(options) {
  options || (options = {});

  _.extend(this, options);
}

_.extend(HttpAPI.prototype, {
  get: function (options) {
    return this.request(requestOptions('GET', this.baseUrl, options));
  },
  put: function (options) {
    return this.request(requestOptions('PUT', this.baseUrl, options));
  },
  post: function (options) {
    return this.request(requestOptions('POST', this.baseUrl, options));
  },
  delete: function (options) {
    return this.request(requestOptions('DELETE', this.baseUrl, options));
  },
  request: function (options) {
    return http.request(options);
  }
});

function requestOptions(method, baseUrl, options) {
  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  options.method = method;
  options.type || (options.type = 'json');
  options.contentType || (options.contentType = 'application/json');

  if (options.contentType === 'application/json') {
    options.processData = false;
    options.data = JSON.stringify(options.data);
  }

  if (baseUrl) {
    var separator = '';
    var firstCharOfUrl = options.url[0];
    var lastCharOfBaseUrl = baseUrl[baseUrl.length - 1];

    // Do some text wrangling to make sure concatenation of base url
    // stupid people (i.e. me)
    if (lastCharOfBaseUrl !== '/' && firstCharOfUrl !== '/') {
      separator = '/';
    } else if (lastCharOfBaseUrl === '/' && firstCharOfUrl === '/') {
      options.url = options.url.substring(1);
    }

    options.url = baseUrl + separator + options.url;
  }

  return options;
}

module.exports = HttpAPI;