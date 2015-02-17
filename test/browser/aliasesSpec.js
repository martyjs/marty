var expect = require('chai').expect;

describe('aliases', function () {
  describe('marty/dispatcher', function () {
    it('should resolve to dispatcher', function () {
      expect(require('../../dispatcher')).to.equal(require('../../lib/dispatcher'));
    });
  });

  describe('marty/store', function () {
    it('should resolve to store', function () {
      expect(require('../../store')).to.equal(require('../../lib/store'));
    });
  });

  describe('marty/fetch', function () {
    it('should resolve to fetch', function () {
      expect(require('../../fetch')).to.equal(require('../../lib/fetch'));
    });
  });

  describe('marty/when', function () {
    it('should resolve to when', function () {
      expect(require('../../when')).to.equal(require('../../lib/when'));
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

  describe('marty/warnings', function () {
    it('should resolve to warnings', function () {
      expect(require('../../warnings')).to.equal(require('../../lib/warnings'));
    });
  });

  describe('marty/logger', function () {
    it('should resolve to logger', function () {
      expect(require('../../logger')).to.equal(require('../../lib/logger'));
    });
  });

  describe('marty/actionPayload', function () {
    it('should resolve to actionPayload', function () {
      expect(require('../../actionPayload')).to.equal(require('../../lib/actionPayload'));
    });
  });

  describe('marty/stateSource', function () {
    it('should resolve to stateSource', function () {
      expect(require('../../stateSource')).to.equal(require('../../lib/stateSource'));
    });
  });

  describe('marty/diagnostics', function () {
    it('should resolve to diagnostics', function () {
      expect(require('../../diagnostics')).to.equal(require('../../lib/diagnostics'));
    });
  });

  describe('marty/constants/actions', function () {
    it('should resolve to action constants', function () {
      var actions = require('../../constants/actions');
      expect(Object.keys(actions)).to.eql(['ACTION_STARTING', 'ACTION_DONE', 'ACTION_FAILED']);
    });
  });

  describe('marty/constants/status', function () {
    it('should resolve to status constants', function () {
      expect(Object.keys(require('../../constants/status'))).to.eql(['PENDING', 'FAILED', 'DONE']);
    });
  });

  describe('marty/http/stateSource', function () {
    it('should resolve to http state source', function () {
      expect(require('../../http/stateSource')).to.eql(require('../../lib/stateSources/http'));
    });
  });
});