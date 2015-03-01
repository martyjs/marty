var _ = require('underscore');

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
};

module.exports = warnings;

function without(warningsToDisable, cb, context) {
  if (!_.isArray(warningsToDisable)) {
    warningsToDisable = [warningsToDisable];
  }

  if (context) {
    cb = _.bind(cb, context);
  }

  try {
    _.each(warningsToDisable, function (warning) {
      warnings[warning] = false;
    });

    cb();
  } finally {
    _.each(warningsToDisable, function (warning) {
      warnings[warning] = true;
    });
  }
}