var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');
var Diagostics = require('./lib/diagnostics');

var Marty = _.extend({
  version: '0.8.4',
  Diagostics: Diagostics,
  Dispatcher: Dispatcher.getCurrent()
}, state, create);

module.exports = Marty;