let _ = require('../utils/mindash');
let StateSource = require('./stateSource');
let createClass = require('../createClass');
let HttpStateSource = require('./inbuilt/http');
let CookieStateSource = require('./inbuilt/cookie');
let LocationStateSource = require('./inbuilt/location');
let JSONStorageStateSource = require('./inbuilt/jsonStorage');
let LocalStorageStateSource = require('./inbuilt/localStorage');
let SessionStorageStateSource = require('./inbuilt/sessionStorage');

function createStateSourceClass(properties) {
  properties = properties || {};

  let merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType(properties.type));
}

function baseType(type) {
  switch (type) {
    case 'http':
      return HttpStateSource;
    case 'location':
      return LocationStateSource;
    case 'jsonStorage':
      return JSONStorageStateSource;
    case 'localStorage':
      return LocalStorageStateSource;
    case 'sessionStorage':
      return SessionStorageStateSource;
    case 'cookie':
      return CookieStateSource;
    default:
      return StateSource;
  }
}

module.exports = createStateSourceClass;