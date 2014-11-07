var expect = require('chai').expect;
var constants = require('../lib/constants');

describe('Constants', function () {
  describe('when you pass in null', function () {
    it('should return an empty object literal');
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
});