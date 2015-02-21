var Context = require('../context');

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (obj instanceof Context) {
    return obj;
  }

  if (obj.context instanceof Context) {
    return obj.context;
  }

  if (obj.__context instanceof Context) {
    return obj.__context;
  }
}

module.exports = getContext;