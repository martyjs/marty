var Dispatcher = require('flux').Dispatcher;
var instance = new Dispatcher();

Dispatcher.getCurrent = function () {
  return instance;
};

module.exports = Dispatcher;