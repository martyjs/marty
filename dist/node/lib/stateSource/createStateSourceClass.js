"use strict";

var _ = require("../utils/mindash");
var StateSource = require("./stateSource");
var createClass = require("../createClass");
var HttpStateSource = require("./inbuilt/http");
var CookieStateSource = require("./inbuilt/cookie");
var LocationStateSource = require("./inbuilt/location");
var JSONStorageStateSource = require("./inbuilt/jsonStorage");
var LocalStorageStateSource = require("./inbuilt/localStorage");
var SessionStorageStateSource = require("./inbuilt/sessionStorage");

function createStateSourceClass(properties) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType(properties.type));
}

function baseType(type) {
  switch (type) {
    case "http":
      return HttpStateSource;
    case "location":
      return LocationStateSource;
    case "jsonStorage":
      return JSONStorageStateSource;
    case "localStorage":
      return LocalStorageStateSource;
    case "sessionStorage":
      return SessionStorageStateSource;
    case "cookie":
      return CookieStateSource;
    default:
      return StateSource;
  }
}

module.exports = createStateSourceClass;