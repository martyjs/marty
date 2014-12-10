var state = require('./lib/state');
var create = require('./lib/create');
var _ = require('./lib/utils/tinydash');
var Dispatcher = require('./lib/dispatcher');
var Diagnostics = require('./lib/diagnostics');
var ActionPayload = require('./lib/actionPayload');
var ActionStore = require('./lib/stores/actionsStore');
var StoreQueryResult = require('./lib/storeQuery/result');

var Marty = _.extend({
  getAction: getAction,
  Diagnostics: Diagnostics,
  ActionPayload: ActionPayload,
  StoreQueryResult: StoreQueryResult,
  Dispatcher: Dispatcher.getCurrent(),
  Stores: {
    Actions: ActionStore
  }
}, state, create);

function getAction(token) {
  return ActionStore.getAction(token);
}

module.exports = Marty;

