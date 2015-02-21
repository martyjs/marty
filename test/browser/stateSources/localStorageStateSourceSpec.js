var expect = require('chai').expect;
var Marty = require('../../../index');
var warnings = require('../../../warnings');

describe('LocalStorageStateSource', function () {

  var source;

  beforeEach(function () {
    warnings.classDoesNotHaveAnId = false;

    localStorage.clear();
    source = Marty.createStateSource({
      type: 'localStorage'
    });
  });

  afterEach(function () {
    warnings.classDoesNotHaveAnId = true;
  });

  describe('#createRepository()', function () {
    it('should expose get and set methods', function () {
      expect(source).to.have.property('get');
      expect(source).to.have.property('set');
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      source.set('foo', 'bar');
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
      expect(source.get('foo')).to.equal('bar');
    });
  });

  describe('#namespace', function () {
    beforeEach(function () {
      source = Marty.createStateSource({
        namespace: 'baz',
        type: 'localStorage'
      });
    });

    describe('when you pass in a namespace', function () {
      describe('when retrieving data', function () {
        beforeEach(function () {
          localStorage.setItem('bazfoo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(source.get('foo')).to.equal('bar');
        });
      });

      describe('when storing data', function () {
        beforeEach(function () {
          source.set('foo', 'bar');
        });

        it('should prepend namespace to key', function () {
          expect(localStorage.getItem('bazfoo')).to.equal('bar');
        });
      });
    });
  });

});