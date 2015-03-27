var DEFAULT_CLASS_NAME = 'Class';

function getClassName(clazz) {
  var className = clazz.name || (clazz.constructor && clazz.constructor.name);

  if (!className) {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec(clazz.toString());
    className = (results && results.length > 1) ? results[1] : '';
  }

  return className === DEFAULT_CLASS_NAME ? null : className;
}

module.exports = getClassName;
