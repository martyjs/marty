var _ = require('lodash');
var sinon = require('sinon');
var logger = require('../../lib/logger');

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