var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');
var ActionPayload = require('./lib/actionPayload');
var ActionStore = require('./lib/stores/actionsStore');

var Marty = _.extend({
  version: '0.6.0',
  Actions: ActionStore,
  Diagnostics: Diagnostics,
  ActionPayload: ActionPayload,
  Dispatcher: Dispatcher.getCurrent(),
  Errors: {
    NotFound: require('./lib/errors/notFound'),
    CompoundError: require('./lib/errors/compoundError')
  }
}, state, create);

module.exports = Marty;