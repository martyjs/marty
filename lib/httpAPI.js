var _ = require('lodash');
var http = require('http');

function HttpAPI(options) {
  options || (options = {});

  _.extend(this, options);

  this.initialize.apply(this, arguments);
}

HttpAPI.prototype = {
  initialize: function () {
  },
  get: function (url, options) {
    if (!options) {
      if (_.isObject(url)) {
        options = url;
      } else if (_.isString(url)) {
        options = {
          url: url
        };
      }
    } else {
      options.url = url;
    }

    return this.request(_.extend(options, {
      method: 'GET'
    }));
  },
  post: function (url, data) {
    var options;

    if (!data) {
      // passing in options
      options = url;
    } else {
      options = {
        url: url,
        data: data
      };
    }

    return this.request(_.extend(options, {
      method: 'POST'
    }));
  },
  request: function (options) {
    if (!options.url) {
      throw new Error('Must specify a url');
    }

    if (this.baseUrl) {
      options.url = this.baseUrl += options.url;
    }

    return request(options);
  }
};

function request(options) {
  // use http
  http.request(options);
}

module.exports = HttpAPI;