var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');

var Marty = _.extend({
  version: '0.8.4',
  Dispatcher: Dispatcher.getCurrent()
}, state, create);

module.exports = Marty;