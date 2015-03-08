"use strict";

var log = require("../logger");
var Store = require("./store");
var _ = require("../utils/mindash");
var warnings = require("../warnings");
var createClass = require("../createClass");

var RESERVED_FUNCTIONS = ["getState"];
var VIRTUAL_FUNCTIONS = ["clear", "dispose"];

function createStoreClass(properties) {
  validateStoreOptions(properties);
  addMixins(properties);

  var overrideFunctions = getOverrideFunctions(properties);
  var functionsToOmit = _.union(VIRTUAL_FUNCTIONS, RESERVED_FUNCTIONS);
  var classProperties = _.extend(_.omit(properties, functionsToOmit), overrideFunctions);

  return createClass(classProperties, classProperties, Store);
}

function getOverrideFunctions(properties) {
  var overrideFunctions = _.pick(properties, VIRTUAL_FUNCTIONS);

  _.each(_.functions(overrideFunctions), function (name) {
    var override = overrideFunctions[name];

    overrideFunctions[name] = function () {
      Store.prototype[name].call(this);
      override.call(this);
    };
  });

  return overrideFunctions;
}

function addMixins(properties) {
  var handlers = _.map(properties.mixins, function (mixin) {
    return mixin.handlers;
  });

  var mixins = _.map(properties.mixins, function (mixin) {
    return _.omit(mixin, "handlers");
  });

  _.extend.apply(_, [properties].concat(mixins));
  _.extend.apply(_, [properties.handlers].concat(handlers));
}

function validateStoreOptions(properties) {
  var displayName = properties.displayName;

  _.each(RESERVED_FUNCTIONS, function (functionName) {
    if (properties[functionName]) {
      if (displayName) {
        functionName += " in " + displayName;
      }

      if (warnings.reservedFunction) {
        log.warn("Warning: " + functionName + " is reserved for use by Marty. Please use a different name");
      }
    }
  });
}

module.exports = createStoreClass;