var _ = require('../../utils/mindash');
var cookieFactory = defaultCookieFactory;
var Instances = require('../../instances');
var StateSource = require('../stateSource');

class CookieStateSource extends StateSource {
  constructor(options) {
    super(_.extend({}, options, {
      cookies: cookieFactory()
    }));
    this._isCookieStateSource = true;
  }

  get(key) {
    return getCookies(this).get(key);
  }

  set(key, value, options) {
    return getCookies(this).set(key, value, options);
  }

  expire(key) {
    return getCookies(this).expire(key);
  }

  static set cookieFactory(value) {
    cookieFactory = value;
  }
}

function getCookies(source) {
  return Instances.get(source).cookies;
}

function defaultCookieFactory() {
  return require('cookies-js');
}

module.exports = CookieStateSource;