var _ = require('lodash');
var create = require('./lib/create');
var package = require('./package.json');
var Dispatcher = require('./lib/dispatcher');

var Marty = _.extend({
  version: package.version,
  dispatcher: new Dispatcher()
}, create);

module.exports = Marty;