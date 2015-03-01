var _ = require('underscore');
var Diagnostics = require('./diagnostics');

if (console) {
  module.exports = console;
  module.exports.trace = function trace() {
    if (Diagnostics.enabled) {
      console.log.apply(console, arguments);
    }
  };
} else {
  module.exports = {
    log: _.noop,
    warn: _.noop,
    error: _.noop
  };
}