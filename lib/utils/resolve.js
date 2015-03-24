let log = require('../logger');
let warnings = require('../warnings');
let getContext = require('./getContext');

function resolve(obj, subject) {
  let context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;