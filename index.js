var _ = require('./lib/utils/mindash');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');

var Marty = _.extend({
  version: '0.8.15',
  Diagnostics: Diagnostics,
  Dispatcher: Dispatcher.getCurrent()
}, state, create);

module.exports = Marty;