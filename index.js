var create = require('./lib/create');
var _ = require('./lib/utils/tinydash');
var setState = require('./lib/setState');
var clearState = require('./lib/clearState');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');
var ActionPayload = require('./lib/actionPayload');
var ActionStore = require('./lib/stores/actionsStore');

var Marty = _.extend({
  setState: setState,
  getAction: getAction,
  clearState: clearState,
  Diagnostics: Diagnostics,
  ActionPayload: ActionPayload,
  Dispatcher: Dispatcher.getCurrent(),
  Stores: {
    Actions: ActionStore
  }
}, create);

function getAction(token) {
  return ActionStore.getAction(token);
}

module.exports = Marty;

