require('isomorphic-fetch');

var hooks = [];
var _ = require('underscore');
var log = require('../logger');
var StateSource = require('../stateSource');

class HttpStateSource extends StateSource {
  constructor() {
    this._isHttpStateSource = true;
  }

  request(req) {
    if (!req.headers) {
      req.headers = {};
    }

    beforeRequest(this, req);

    return fetch(req.url, req).then((res) => afterRequest(this, res));
  }

  get(options) {
    return this.request(requestOptions('GET', this, options));
  }

  put(options) {
    return this.request(requestOptions('PUT', this, options));
  }

  post(options) {
    return this.request(requestOptions('POST', this, options));
  }

  delete(options) {
    return this.request(requestOptions('DELETE', this, options));
  }

  patch(options) {
    return this.request(requestOptions('PATCH', this, options));
  }

  static addHook(hook) {
    if (hook) {
      hooks.push(hook);
    }
  }

  static removeHook(hook) {
    hooks = _.without(hooks, hook);
  }

  static get defaultBaseUrl() {
    return '';
  }
}

HttpStateSource.addHook(require('../http/hooks/parseJSON'));
HttpStateSource.addHook(require('../http/hooks/stringifyJSON'));

module.exports = HttpStateSource;

function requestOptions(method, source, options) {
  var baseUrl = source.baseUrl || HttpStateSource.defaultBaseUrl;

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

function beforeRequest(source, req) {
  _.each(getHooks('before'), (hook) => {
    try {
      hook.before.call(source, req);
    } catch (e) {
      log.error('Failed to execute hook before http request', e, hook);
      throw e;
    }
  });
}

function afterRequest(source, res) {
  var current;

  _.each(getHooks('after'), (hook) => {
    var execute = function (res) {
      try {
        return hook.after.call(source, res);
      } catch (e) {
        log.error('Failed to execute hook after http response', e, hook);
        throw e;
      }
    };

    if (current) {
      current = current.then((res) => {
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

function getHooks(func) {
  return _
    .chain(hooks)
    .filter(has(func))
    .sortBy(priority)
    .value();

  function priority(hook) {
    return hook.priority;
  }

  function has(func) {
    return function (hook) {
      return hook && _.isFunction(hook[func]);
    };
  }
}