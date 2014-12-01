function dispatch() {
  var dispatcher = require('../../index').dispatcher;

  return dispatcher.dispatch.apply(dispatcher, arguments);
}

module.exports = dispatch;