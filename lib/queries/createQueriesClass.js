var Queries = require('./queries');
var _ = require('../utils/mindash');
var RESERVED_KEYWORDS = ['dispatch'];
var createClass = require('../createClass');

function createQueriesClass(properties) {
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(`${keyword} is a reserved keyword`);
    }
  });

  var classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, Queries);
}

module.exports = createQueriesClass;