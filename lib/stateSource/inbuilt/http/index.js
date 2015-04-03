require('isomorphic-fetch');

var hooks = {};
var log = require('marty-core/lib/logger');
var _ = require('marty-core/lib/utils/mindash');
var StateSource = require('../../stateSource');
var accepts = {
  html: 'text/html',
  text: 'text/plain',
  json: 'application/json',
  xml: 'application/xml, text/xml',
  script: 'text/javascript, application/javascript, application/x-javascript',
};

class HttpStateSource extends StateSource {
  constructor(options) {
    super(options);
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
      if (_.isUndefined(hook.priority)) {
        hook.priority = Object.keys(hooks).length;
      }

      hooks[hook.id] = hook;
    }
  }

  static removeHook(hook) {
    if (hook) {
      delete hooks[hook.id];
    }
  }

  static get defaultBaseUrl() {
    return '';
  }
}

HttpStateSource.addHook(require('./hooks/parseJSON'));
HttpStateSource.addHook(require('./hooks/stringifyJSON'));
HttpStateSource.addHook(require('./hooks/includeCredentials'));

module.exports = HttpStateSource;

function requestOptions(method, source, options) {
  var baseUrl = source.baseUrl || HttpStateSource.defaultBaseUrl;

  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  _.defaults(options, {
    headers: {}
  });

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

  if (options.contentType) {
    options.headers['Content-Type'] = options.contentType;
  }

  if (options.dataType) {
    var contentType = accepts[options.dataType];

    if (!contentType) {
      log.warn('Unknown data type ' + options.dataType);
    } else {
      options.headers['Accept'] = contentType;
    }
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
  return _.sortBy(_.filter(hooks, has(func)), priority);

  function priority(hook) {
    return hook.priority;
  }

  function has(func) {
    return function (hook) {
      return hook && _.isFunction(hook[func]);
    };
  }
}