var Dispatcher = require('marty-core/lib/dispatcher');

function dispose() {
  Dispatcher.dispose();
  this.registry.dispose();
}

module.exports = dispose;