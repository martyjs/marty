var log = require('../../logger');
var StateSource = require('../stateSource');
var Environment = require('../../environment');

class ServerCookies {
  constructor(req, res) {
    if (!req) {
      throw new Error('req is required');
    }

    if (!res) {
      throw new Error('res is required');
    }

    this.req = req;
    this.res = res;
  }

  get(key) {
    if (this.req.cookies) {
      return this.req.cookies[key];
    }

    log.warn(
      'Warning: Could not find cookies in req. Do you have the cookie-parser middleware ' +
      '(https://www.npmjs.com/package/cookie-parser) installed?'
    );
  }

  set(key, value, options) {
    this.res.cookie(key, value, options);
  }

  expire(key) {
    this.res.clearCookie(key);
  }
}

class CookieStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isCookieStateSource = true;
    this.cookies = this.getCookieStrategy();
  }

  get(key) {
    return this.cookies.get(key);
  }

  set(key, value, options) {
    return this.cookies.set(key, value, options);
  }

  expire(key) {
    return this.cookies.expire(key);
  }

  getCookieStrategy() {
    if (Environment.isBrowser) {
      return require('cookies-js');
    } else if (Environment.isServer) {
      return new ServerCookies(this.context.req, this.context.res);
    } else {
      throw new Error('Unsupported environment');
    }
  }
}

module.exports = CookieStateSource;