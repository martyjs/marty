var expect = require('chai').expect;
var constants = require('../lib/constants');

describe('Constants', function () {
  describe('when you pass in null', function () {
    it('should return an empty object literal', function () {
      expect(constants(null)).to.eql({});
    });
  });

  describe('when you pass in an array', function () {
    it('should return an object of constants', function () {
      var input = ['foo', 'bar'];
      var expectedResult = {
        foo: 'foo',
        bar: 'bar'
      };

      expect(constants(input)).to.eql(expectedResult);
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