let Queries = require('./queries');
let _ = require('../utils/mindash');
let RESERVED_KEYWORDS = ['dispatch'];
let createClass = require('../createClass');

function createQueriesClass(properties) {
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(`${keyword} is a reserved keyword`);
    }
  });

  let classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, Queries);
}

module.exports = createQueriesClass;