var expect = require('chai').expect;
var constants = require('../lib/constants');

describe('Constants', function () {
  var input, actualResult;

  describe('when you pass in null', function () {
    it('should return an empty object literal', function () {
      expect(constants(null)).to.eql({});
    });
  });

  describe.only('when you pass in an array', function () {
    beforeEach(function () {
      input = ['foo', 'bar'];

      actualResult = constants(input);
    });

    it('should create an object with the given keys', function () {
      expect(Object.keys(actualResult)).to.eql(input);
    });

    it('should create a function for each key', function () {
      input.forEach(function (key) {
        expect(actualResult[key]).to.be.instanceof(Function);
      });
    });

    it('should create a function that equals the input string', function () {
      input.forEach(function (key) {
        expect(actualResult[key] == key).to.be.true; // jshint ignore:line
      });
    });
  });

  describe('when you pass in an object of arrays', function () {
    it('should return an object of constants', function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: ['bam']
      };

      var expectedResult = {
        foo: {
          bar: 'bar',
          baz: 'baz'
        },
        bim: {
          bam: 'bam'
        }
      };

      expect(constants(input)).to.eql(expectedResult);
    });
  });

  describe('when I pass in a crazy combination of object literals and arrays', function () {
    it('should return an object of constants', function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: {
          bam: ['what'],
          top: {
            flop: ['bop', 'hot']
          }
        }
      };

      var expectedResult = {
        foo: {
          bar: 'bar',
          baz: 'baz'
        },
        bim: {
          bam: {
            what: 'what'
          },
          top: {
            flop: {
              bop: 'bop',
              hot: 'hot'
            }
          }
        }
      };

      expect(constants(input)).to.eql(expectedResult);
    });
  });
});