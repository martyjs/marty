var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');

var Marty = _.extend({
  version: '0.8.9',
  Diagnostics: Diagnostics,
  Dispatcher: Dispatcher.getCurrent()
}, state, create);

module.exports = Marty;