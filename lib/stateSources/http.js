require('isomorphic-fetch');

var middlewares = [];
var _ = require('underscore');
var log = require('../logger');

HttpStateSource.use = use;
HttpStateSource.remove = remove;
HttpStateSource.use(require('../../http/middleware/parseJSON'));
HttpStateSource.use(require('../../http/middleware/stringifyJSON'));

function HttpStateSource(mixinOptions) {

  mixinOptions = mixinOptions || {};

  var defaultBaseUrl = '';
  var methods = ['get', 'put', 'post', 'delete', 'patch'];

  var mixin = {
    _isHttpStateSource: true,
    request: function (req) {
      if (!req.headers) {
        req.headers = {};
      }

      beforeRequest(req);

      return fetch(req.url, req).then(afterRequest);
    }
  };

  function beforeRequest(req) {
    _.each(getMiddleware('before'), function (middleware) {
      try {
        middleware.before(req);
      } catch (e) {
        log.error('Failed to execute middleware before http request', e, middleware);
        throw e;
      }
    });
  }

  function getMiddleware(func) {
    return _
      .chain(middlewares)
      .filter(has(func))
      .sortBy(priority)
      .value();

    function priority(middleware) {
      return middleware.priority;
    }

    function has(func) {
      return function (middleware) {
        return middleware && _.isFunction(middleware[func]);
      };
    }
  }

  function afterRequest(res) {
    var current;

    _.each(getMiddleware('after'), function (middleware) {
      var execute = function (res) {
        try {
          return middleware.after(res);
        } catch (e) {
          log.error('Failed to execute middleware after http response', e, middleware);
          throw e;
        }
      };

      if (current) {
        current = current.then(function (res) {
          return execute(res);
        });
      } else {
        current = execute(res);

        if (current && !_.isFunction(current.then)) {
          current = Promise.resolve(current);
        }
      }
    });

    return current || res;
  }

  // Sugar methods for common HTTP methods
  _.each(methods, function (method) {
    mixin[method] = function (options) {
      return this.request(requestOptions(method.toUpperCase(), mixinOptions.baseUrl || defaultBaseUrl, options));
    };
  });

  return mixin;
}

function use(middleware) {
  if (middleware) {
    middlewares.push(middleware);
  }
}

function remove(middleware) {
  middlewares = _.without(middlewares, middleware);
}

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

module.exports = HttpStateSource;
