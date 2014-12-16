var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');
var ActionPayload = require('./lib/actionPayload');
var ActionStore = require('./lib/stores/actionsStore');

var Marty = _.extend({
  version: '0.5.5',
  getAction: getAction,
  Diagnostics: Diagnostics,
  ActionPayload: ActionPayload,
  Dispatcher: Dispatcher.getCurrent(),
  Stores: {
    Actions: ActionStore
  }
}, state, create);

function getAction(token) {
  return ActionStore.getAction(token);
}

module.exports = Marty;

