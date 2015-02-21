var _ = require('underscore');
var HttpStateSource = require('./http');
var StateSource = require('./stateSource');
var createClass = require('../createClass');
var JSONStorageStateSource = require('./jsonStorage');
var LocalStorageStateSource = require('./localStorage');
var SessionStorageStateSource = require('./sessionStorage');

function createStateSourceClass(properties) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, baseType(properties.type));
}

function baseType(type) {
  switch (type) {
    case 'http':
      return HttpStateSource;
    case 'jsonStorage':
      return JSONStorageStateSource;
    case 'localStorage':
      return LocalStorageStateSource;
    case 'sessionStorage':
      return SessionStorageStateSource;
    default:
      return StateSource;
  }
}

module.exports = createStateSourceClass;