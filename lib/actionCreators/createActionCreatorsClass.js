let _ = require('../utils/mindash');
let createClass = require('../createClass');
let ActionCreators = require('./actionCreators');
let RESERVED_KEYWORDS = ['dispatch'];

function createActionCreatorsClass(properties) {
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error(`${keyword} is a reserved keyword`);
    }
  });

  let classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, ActionCreators);
}

module.exports = createActionCreatorsClass;