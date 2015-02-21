var getContext = require('./getContext');

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  return obj;
}

module.exports = resolve;