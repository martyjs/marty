var log = require('../logger');
var warnings = require('../warnings');
var getContext = require('./getContext');

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;