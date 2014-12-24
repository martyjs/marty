var expect = require('chai').expect;
var LocalStorageRepository = require("../lib/repositories/localStorage");

describe('LocalStorageRepository', function () {

  var mixin;

  beforeEach(function () {
    localStorage.clear();
    mixin = LocalStorageRepository();
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

    it('should store data under key in localStorage', function () {
      expect(localStorage.getItem('foo')).to.equal('bar');
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      localStorage.setItem('foo', 'bar');
    });

    it('should retrieve data under key in localStorage', function () {
      expect(mixin.get('foo')).to.equal('bar');
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      mixin = LocalStorageRepository({
        namespace: 'baz'
      });
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          localStorage.setItem('bazfoo', 'bar');
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
          expect(localStorage.getItem('bazfoo')).to.equal('bar');
        });
      });
    });
  });

});