let warnings = {
  callingResolverOnServer: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  contextNotPassedInToConstructor: true,
  promiseNotReturnedFromRemotely: true,
  reservedFunction: true,
  stateIsNullOrUndefined: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  without: without
};

function without(warningsToDisable, cb, context) {
  if (!Array.isArray(warningsToDisable)) {
    warningsToDisable = [warningsToDisable];
  }

  if (context) {
    cb = cb.bind(context);
  }

  try {
    warningsToDisable.forEach(warning => warnings[warning] = false);
    cb();
  } finally {
    warningsToDisable.forEach(warning => warnings[warning] = true);
  }
}

export default warnings
