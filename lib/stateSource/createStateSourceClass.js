var _ = require('underscore');
var StateSource = require('./stateSource');
var createClass = require('../createClass');
var HttpStateSource = require('../../stateSources/http');
var JSONStorageStateSource = require('../../stateSources/jsonStorage');
var LocalStorageStateSource = require('../../stateSources/localStorage');
var SessionStorageStateSource = require('../../stateSources/sessionStorage');

function createStateSourceClass(properties) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType(properties.type));
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