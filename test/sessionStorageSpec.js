var expect = require('chai').expect;
var SessionStorageRepository = require("../lib/repositories/sessionStorage");

describe('SessionStorageRepository', function () {

  var mixin;

  beforeEach(function () {
    sessionStorage.clear();
    mixin = SessionStorageRepository();
  });

  describe('#createRepository()', function () {
    it('should expose get and set methods', function () {
      expect(mixin).to.include.keys('get', 'set');
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      mixin.set('foo', 'bar');
    });

    it('should store data under key in sessionStorage', function () {
      expect(sessionStorage.getItem('foo')).to.equal('bar');
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      sessionStorage.setItem('foo', 'bar');
    });

    it('should retrieve data under key in sessionStorage', function () {
      expect(mixin.get('foo')).to.equal('bar');
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      mixin = SessionStorageRepository({
        namespace: 'baz'
      });
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          sessionStorage.setItem('bazfoo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(mixin.get('foo')).to.equal('bar');
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          mixin.set('foo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(sessionStorage.getItem('bazfoo')).to.equal('bar');
        });
      });
    });
  });

});