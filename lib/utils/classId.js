var uuid = require('./uuid');
var log = require('../logger');
var warnings = require('../warnings');
var humanStrings = require('./humanStrings');

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  var displayName = '';

  if (clazz.displayName) {
    displayName = `'${clazz.displayName}' `;
  }

  var typeDisplayName = humanStrings[type] || type;

  if (warnings.classDoesNotHaveAnId) {
    log.warn(`Warning: The ${typeDisplayName} ${displayName}does not have an Id`);
  }

  return clazz.displayName || uuid.generate();
}

module.exports = classId;