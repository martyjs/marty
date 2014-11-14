var _ = require('lodash');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');

var Marty = _.extend({
  dispatcher: new Dispatcher()
}, create);

module.exports = Marty;