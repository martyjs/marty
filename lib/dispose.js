var Dispatcher = require('./dispatcher');

function dispose() {
  Dispatcher.dispose();
  this.container.dispose();
}

module.exports = dispose;