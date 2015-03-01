function dispatch() {
  var dispatcher = require('../../../browser').Dispatcher;

  return dispatcher.dispatch.apply(dispatcher, arguments);
}

module.exports = dispatch;