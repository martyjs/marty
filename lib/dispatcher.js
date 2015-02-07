var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var defaultDispatcher = createDispatcher();
defaultDispatcher.isDefault = true;

createDispatcher.getDefault = function () {
  return defaultDispatcher;
};

module.exports = createDispatcher;

function createDispatcher() {
  var dispatcher = new Dispatcher();
  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  return dispatcher;
}