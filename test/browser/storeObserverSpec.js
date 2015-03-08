var expect = require('chai').expect;
var stubbedLogger = require('../lib/stubbedLogger');
var StoreObserver = require('../../lib/storeObserver');

describe('StoreObserver', function () {

  describe('when an error is thrown when getting state', function () {
    var expectedError, observer, logger, expectedComponent;

    beforeEach(function () {
      logger = stubbedLogger();

      expectedError = new Error('Bar');
      expectedComponent = {
        displayName: 'Test',
        getState: function () {
          throw expectedError;
        },
        setState: function () {
        }
      };

      observer = new StoreObserver(expectedComponent, []);

      try {
        observer.onStoreChanged(null, {}, expectedComponent);
      } catch (e) { }
    });

    it('should log the error and any additional metadata', function () {
      var expectedMessage = 'An error occured while trying to get the latest state in the view Test';

      expect(logger.error).to.be.calledWith(expectedMessage, expectedError, expectedComponent);
    });

    afterEach(function () {
      logger.restore();
    });
  });
});