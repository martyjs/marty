var Diagnostics = require('../diagnostics');

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  if (clazz.displayName) {
    Diagnostics.warn(
      'Warning: The', type,
      clazz.displayName, 'does not have an Id'
    );
    return clazz.displayName;
  }
}

module.exports = classId;