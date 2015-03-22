var Dispatcher = require('./dispatcher');

function dispose() {
  Dispatcher.dispose();
  this.registry.dispose();
}

module.exports = dispose;