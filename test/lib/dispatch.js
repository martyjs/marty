var dispatcher = require('../../index').dispatcher;

function dispatch() {
  return dispatcher.dispatch.apply(dispatcher, arguments);
}

module.exports = dispatch;