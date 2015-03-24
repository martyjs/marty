let uuid = require('./uuid');
let log = require('../logger');
let warnings = require('../warnings');
let humanStrings = require('./humanStrings');

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  let displayName = '';

  if (clazz.displayName) {
    displayName = `'${clazz.displayName}' `;
  }

  let typeDisplayName = humanStrings[type] || type;

  if (warnings.classDoesNotHaveAnId) {
    log.warn(`Warning: The ${typeDisplayName} ${displayName}does not have an Id`);
  }

  return clazz.displayName || uuid.generate();
}

module.exports = classId;