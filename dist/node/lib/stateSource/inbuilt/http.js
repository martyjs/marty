"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

require("isomorphic-fetch");

var hooks = {};
var _ = require("underscore");
var log = require("../../logger");
var StateSource = require("../stateSource");

var HttpStateSource = (function (StateSource) {
  function HttpStateSource(options) {
    _classCallCheck(this, HttpStateSource);

    _get(Object.getPrototypeOf(HttpStateSource.prototype), "constructor", this).call(this, options);
    this._isHttpStateSource = true;
  }

  _inherits(HttpStateSource, StateSource);

  _prototypeProperties(HttpStateSource, {
    addHook: {
      value: function addHook(hook) {
        if (hook) {
          hooks[hook.id] = hook;
        }
      },
      writable: true,
      configurable: true
    },
    removeHook: {
      value: function removeHook(hook) {
        if (hook) {
          delete hooks[hook.id];
        }
      },
      writable: true,
      configurable: true
    },
    defaultBaseUrl: {
      get: function () {
        return "";
      },
      configurable: true
    }
  }, {
    request: {
      value: function request(req) {
        var _this = this;

        if (!req.headers) {
          req.headers = {};
        }

        beforeRequest(this, req);

        return fetch(req.url, req).then(function (res) {
          return afterRequest(_this, res);
        });
      },
      writable: true,
      configurable: true
    },
    get: {
      value: function get(options) {
        return this.request(requestOptions("GET", this, options));
      },
      writable: true,
      configurable: true
    },
    put: {
      value: function put(options) {
        return this.request(requestOptions("PUT", this, options));
      },
      writable: true,
      configurable: true
    },
    post: {
      value: function post(options) {
        return this.request(requestOptions("POST", this, options));
      },
      writable: true,
      configurable: true
    },
    "delete": {
      value: function _delete(options) {
        return this.request(requestOptions("DELETE", this, options));
      },
      writable: true,
      configurable: true
    },
    patch: {
      value: function patch(options) {
        return this.request(requestOptions("PATCH", this, options));
      },
      writable: true,
      configurable: true
    }
  });

  return HttpStateSource;
})(StateSource);

HttpStateSource.addHook(require("../../../http/hooks/parseJSON"));
HttpStateSource.addHook(require("../../../http/hooks/stringifyJSON"));

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
    var separator = "";
    var firstCharOfUrl = options.url[0];
    var lastCharOfBaseUrl = baseUrl[baseUrl.length - 1];

    // Do some text wrangling to make sure concatenation of base url
    // stupid people (i.e. me)
    if (lastCharOfBaseUrl !== "/" && firstCharOfUrl !== "/") {
      separator = "/";
    } else if (lastCharOfBaseUrl === "/" && firstCharOfUrl === "/") {
      options.url = options.url.substring(1);
    }

    options.url = baseUrl + separator + options.url;
  }

  return options;
}

function beforeRequest(source, req) {
  _.each(getHooks("before"), function (hook) {
    try {
      hook.before.call(source, req);
    } catch (e) {
      log.error("Failed to execute hook before http request", e, hook);
      throw e;
    }
  });
}

function afterRequest(source, res) {
  var current;

  _.each(getHooks("after"), function (hook) {
    var execute = function execute(res) {
      try {
        return hook.after.call(source, res);
      } catch (e) {
        log.error("Failed to execute hook after http response", e, hook);
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

function getHooks(func) {
  return _.chain(hooks).filter(has(func)).sortBy(priority).value();

  function priority(hook) {
    return hook.priority;
  }

  function has(func) {
    return function (hook) {
      return hook && _.isFunction(hook[func]);
    };
  }
}