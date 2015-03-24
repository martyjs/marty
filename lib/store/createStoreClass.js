let log = require('../logger');
let Store = require('./store');
let _ = require('../utils/mindash');
let warnings = require('../warnings');
let createClass = require('../createClass');

let RESERVED_FUNCTIONS = ['getState'];
let VIRTUAL_FUNCTIONS = ['clear', 'dispose'];

function createStoreClass(properties) {
  validateStoreOptions(properties);
  addMixins(properties);

  let overrideFunctions = getOverrideFunctions(properties);
  let functionsToOmit = _.union(VIRTUAL_FUNCTIONS, RESERVED_FUNCTIONS);
  let classProperties = _.extend(_.omit(properties, functionsToOmit), overrideFunctions);

  return createClass(classProperties, classProperties, Store);
}

function getOverrideFunctions(properties) {
  let overrideFunctions = _.pick(properties, VIRTUAL_FUNCTIONS);

  _.each(_.functions(overrideFunctions), function (name) {
    let override = overrideFunctions[name];

    overrideFunctions[name] = function () {
      Store.prototype[name].call(this);
      override.call(this);
    };
  });

  return overrideFunctions;
}

function addMixins(properties) {
  let handlers = _.map(properties.mixins, function (mixin) {
    return mixin.handlers;
  });

  let mixins = _.map(properties.mixins, function (mixin) {
    return _.omit(mixin, 'handlers');
  });

  _.extend.apply(_, [properties].concat(mixins));
  _.extend.apply(_, [properties.handlers].concat(handlers));
}

function validateStoreOptions(properties) {
  let displayName = properties.displayName;

  _.each(RESERVED_FUNCTIONS, function (functionName) {
    if (properties[functionName]) {
      if (displayName) {
        functionName += ' in ' + displayName;
      }

      if (warnings.reservedFunction) {
        log.warn(
          `Warning: ${functionName} is reserved for use by Marty. Please use a different name`
        );
      }
    }
  });
}

module.exports = createStoreClass;