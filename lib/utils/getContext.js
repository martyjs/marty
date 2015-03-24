let Context = require('../context');

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

  if (obj.context && obj.context.marty) {
    return obj.context.marty;
  }
}

module.exports = getContext;