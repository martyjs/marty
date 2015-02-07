var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var defaultInstance = createDispatcher();

createDispatcher.getCurrent = function () {
  return defaultInstance;
};

module.exports = createDispatcher;

function createDispatcher() {
  var dispatcher = new Dispatcher();
  dispatcher.id = uuid.generate();
  return dispatcher;
}