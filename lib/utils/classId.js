var uuid = require('./uuid');
var Diagnostics = require('../diagnostics');

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  Diagnostics.warn(
    'Warning: The', type,
    clazz.displayName, 'does not have an Id'
  );

  return clazz.displayName || uuid.generate();
}

module.exports = classId;