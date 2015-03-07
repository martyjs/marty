var expect = require('chai').expect;
var Marty = require('../../../marty');
var warnings = require('../../../lib/warnings');
var describeStyles = require('../../lib/describeStyles');

describeStyles('LocalStorageStateSource', function (styles) {
  var source;

  beforeEach(function () {
    warnings.classDoesNotHaveAnId = false;

    localStorage.clear();
    source = styles({
      classic: function () {
        return Marty.createStateSource({
          type: 'localStorage'
        });
      },
      es6: function () {
        class LocalStorage extends Marty.LocalStorageStateSource {
        }

        return new LocalStorage();
      }
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
      source = styles({
        classic: function () {
          return Marty.createStateSource({
            namespace: 'baz',
            type: 'localStorage'
          });
        },
        es6: function () {
          class LocalStorage extends Marty.LocalStorageStateSource {
            get namespace() {
              return 'baz';
            }
          }

          return new LocalStorage();
        }
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