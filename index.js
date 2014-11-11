var _ = require('lodash');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');

var Marty = _.extend({
  version: '0.0.9',
  dispatcher: new Dispatcher()
}, create);

module.exports = Marty;