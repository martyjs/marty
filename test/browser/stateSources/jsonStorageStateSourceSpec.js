var expect = require('chai').expect;
var JSONStorageStateSource = require('../../../lib/stateSources/jsonStorage');

describe('JSONStorageStateSource', function () {

  var mixin, payload, serializedPayload;

  payload = {
    value: {
      bar: 'bar'
    }
  };
  serializedPayload = JSON.stringify(payload);

  beforeEach(function () {
    localStorage.clear();
    sessionStorage.clear();
    mixin = new JSONStorageStateSource();
  });

  describe('#createRepository()', function () {
    it('should expose get and set methods', function () {
      expect(mixin).to.include.keys('get', 'set');
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      mixin.set('foo', payload.value);
    });

    it('should store serialized data under key in localStorage', function () {
      var raw = localStorage.getItem('foo');
      expect(raw).to.equal(serializedPayload);
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      localStorage.setItem('foo', serializedPayload);
    });

    it('should retrieve serialized data under key in localStorage', function () {
      expect(mixin.get('foo')).to.deep.equal(payload.value);
    });
  });

  describe('#storage', function () {
    describe('when you pass in a custom web storage object', function () {
      beforeEach(function () {
        mixin = new JSONStorageStateSource({
          storage: sessionStorage
        });
        mixin.set('foo', payload.value);
      });
      it('should use the custom web storage object', function () {
        expect(sessionStorage.getItem('foo')).to.equal(serializedPayload);
      });
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      mixin = new JSONStorageStateSource({
        namespace: 'baz'
      });
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          localStorage.setItem('bazfoo', serializedPayload);
        });

        it('should prepend namespace to key', function () {
          expect(mixin.get('foo')).to.deep.equal(payload.value);
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          mixin.set('foo', payload.value);
        });

        it('should prepend namespace to key', function () {
          expect(localStorage.getItem('bazfoo')).to.equal(serializedPayload);
        });
      });
    });
  });

});