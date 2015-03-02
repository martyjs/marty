var sinon = require('sinon');
var _ = require('underscore');
var logger = require('../../logger');

function stubLogger(Marty) {
  var sandbox = sinon.sandbox.create();

  _.each(Marty.logger, function (func, key) {
    sandbox.stub(logger, key);
  });

  return _.extend({
    restore: function () {
      sandbox.restore();
    }
  }, logger);
}

module.exports = stubLogger;