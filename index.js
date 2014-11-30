var create = require('./lib/create');
var _ = require('./lib/utils/tinydash');
var Dispatcher = require('./lib/dispatcher');
var diagnostics = require('./lib/diagnostics');
var constants = require('./lib/internalConstants');

var Marty = _.extend({
  constants: constants,
  getAction: getAction,
  diagnostics: diagnostics,
  dispatcher: new Dispatcher(),
}, create);

module.exports = Marty;

Marty.Stores = {
  Actions: require('./lib/stores/actionsStore')
};

function getAction(token) {
  return Marty.Stores.Actions.getAction(token);
}