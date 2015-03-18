"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var log = require("../../logger");
var _ = require("../../utils/mindash");
var Instances = require("../../instances");
var StateSource = require("../stateSource");
var Environment = require("../../environment");

var CookieStateSource = (function (_StateSource) {
  function CookieStateSource(options) {
    _classCallCheck(this, CookieStateSource);

    _get(Object.getPrototypeOf(CookieStateSource.prototype), "constructor", this).call(this, options);
    this._isCookieStateSource = true;
    this.cookies = this.getCookieStrategy();
  }

  _inherits(CookieStateSource, _StateSource);

  _createClass(CookieStateSource, {
    get: {
      value: function get(key) {
        return this.cookies.get(key);
      }
    },
    set: {
      value: function set(key, value, options) {
        return this.cookies.set(key, value, options);
      }
    },
    expire: {
      value: function expire(key) {
        return this.cookies.expire(key);
      }
    },
    getCookieStrategy: {
      value: function getCookieStrategy() {
        if (Environment.isBrowser) {
          return require("cookies-js");
        } else if (Environment.isServer) {
          return new ServerCookies(this.context.req, this.context.res);
        } else {
          throw new Error("Unsupported environment");
        }
      }
    }
  });

  return CookieStateSource;
})(StateSource);

module.exports = CookieStateSource;

var ServerCookies = (function () {
  function ServerCookies(req, res) {
    _classCallCheck(this, ServerCookies);

    if (!req) {
      throw new Error("req is required");
    }

    if (!res) {
      throw new Error("res is required");
    }

    this.req = req;
    this.res = res;
  }

  _createClass(ServerCookies, {
    get: {
      value: function get(key) {
        if (this.req.cookies) {
          return this.req.cookies[key];
        }

        log.warn("Warning: Could not find cookies in req. Do you have the cookie-parser middleware " + "(https://www.npmjs.com/package/cookie-parser) installed?");
      }
    },
    set: {
      value: function set(key, value, options) {
        this.res.cookie(key, value, options);
      }
    },
    expire: {
      value: function expire(key) {
        this.res.clearCookie(key);
      }
    }
  });

  return ServerCookies;
})();