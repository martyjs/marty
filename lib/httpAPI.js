require('es6-promise').polyfill();
require('isomorphic-fetch');

var fetch = window.fetch;
var CONTENT_TYPE = 'Content-Type';
var _ = require('./utils/tinydash');
var JSON_CONTENT_TYPE = 'application/json';

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
    if (!options.headers) {
      options.headers = {};
    }

    if (contentType() === JSON_CONTENT_TYPE && _.isObject(options.body)) {
      options.headers[CONTENT_TYPE] = JSON_CONTENT_TYPE;
      options.body = JSON.stringify(options.body);
    }

    return fetch(options.url, options).then(function (res) {
      if (isJson(res)) {
        res.data = JSON.parse(res._body);
      }

      return res;
    });

    function isJson(res) {
      return res.headers.get(CONTENT_TYPE).indexOf(JSON_CONTENT_TYPE) !== -1;
    }

    function contentType() {
      return options.headers[CONTENT_TYPE] || JSON_CONTENT_TYPE;
    }
  }
});

function requestOptions(method, baseUrl, options) {
  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  options.method = method.toLowerCase();

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