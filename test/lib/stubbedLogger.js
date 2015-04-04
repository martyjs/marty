var sinon = require('sinon');
var logger = require('marty-core/lib/logger');
var _ = require('marty-core/lib/utils/mindash');

function stubbedLogger() {
  var sandbox = sinon.sandbox.create();

  _.each(logger, function (func, key) {
    sandbox.stub(logger, key);
  });

  return _.extend({
    restore: function () {
      sandbox.restore();
    }
  }, logger);
}

module.exports = stubbedLogger;