var _ = require('lodash');
var create = require('./lib/create');
var package = require('./package.json');

var Marty = _.extend({
  version: package.version
}, create);

module.exports = Marty;