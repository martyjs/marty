var uuid = require('./utils/uuid');
var Dispatcher = require('flux').Dispatcher;
var instance = new Dispatcher();

instance.id = uuid.small();

Dispatcher.getCurrent = function () {
  return instance;
};

module.exports = Dispatcher;