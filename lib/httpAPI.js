require('isomorphic-fetch');
require('es6-promise').polyfill();

var fetch = window.fetch;
var _ = require('underscore');
var CONTENT_TYPE = 'Content-Type';
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
      options.body = JSON.stringify(options.body);
      options.headers[CONTENT_TYPE] = JSON_CONTENT_TYPE;
    }

    return fetch(options.url, options).then(function (res) {
      if (isJson(res)) {
        res.body = JSON.parse(res._body);
      }

      return res;
    });

    function isJson(res) {
      var contentTypes = getHeader(res, CONTENT_TYPE);

      _.isArray(contentTypes) || (contentTypes = [contentTypes]);

      return _.any(contentTypes, function (contentType) {
        return contentType.indexOf(JSON_CONTENT_TYPE) !== -1;
      });
    }

    function getHeader(res, name) {
      return _.find(res.headers.map, function (value, key) {
        return key.toLowerCase() === name.toLowerCase();
      });
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