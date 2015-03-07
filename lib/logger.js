var _ = require('./utils/mindash');

if (console) {
  module.exports = console;
} else {
  module.exports = {
    log: _.noop,
    warn: _.noop,
    error: _.noop
  };
}