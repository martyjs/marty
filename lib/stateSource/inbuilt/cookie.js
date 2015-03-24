let cookieFactory = defaultCookieFactory;
let StateSource = require('../stateSource');

class CookieStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isCookieStateSource = true;
    this._cookies = cookieFactory(this.context);
  }

  get(key) {
    return this._cookies.get(key);
  }

  set(key, value, options) {
    return this._cookies.set(key, value, options);
  }

  expire(key) {
    return this._cookies.expire(key);
  }

  static setCookieFactory(value) {
    cookieFactory = value;
  }
}

function defaultCookieFactory() {
  return require('cookies-js');
}

module.exports = CookieStateSource;