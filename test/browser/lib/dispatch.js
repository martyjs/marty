function dispatch() {
  var dispatcher = require('../../../index').Dispatcher;

  return dispatcher.dispatch.apply(dispatcher, arguments);
}

module.exports = dispatch;