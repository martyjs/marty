function dispatch() {
  var dispatcher = require('../../../marty').Dispatcher;

  return dispatcher.dispatch.apply(dispatcher, arguments);
}

module.exports = dispatch;