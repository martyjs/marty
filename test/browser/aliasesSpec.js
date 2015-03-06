var expect = require('chai').expect;

describe('aliases', function () {
  describe('marty/fetch', function () {
    it('should resolve to fetch', function () {
      expect(require('../../fetch')).to.equal(require('../../lib/store/fetchResult'));
    });
  });

  describe('marty/when', function () {
    it('should resolve to when', function () {
      expect(require('../../when')).to.equal(require('../../lib/store/when'));
    });
  });

  describe('marty/constants', function () {
    it('should resolve to constants', function () {
      expect(require('../../constants')).to.equal(require('../../lib/constants'));
    });
  });

  describe('marty/environment', function () {
    it('should resolve to environment', function () {
      expect(require('../../environment')).to.equal(require('../../lib/environment'));
    });
  });

  describe('marty/constants/status', function () {
    it('should resolve to status constants', function () {
      expect(Object.keys(require('../../constants/status'))).to.eql(['PENDING', 'FAILED', 'DONE']);
    });
  });
});