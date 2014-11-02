var Marty = require('../index');
var expect = require('chai').expect;

describe('#createConstants()', function () {
  describe('when you pass in an array', function () {
    it('should return an object of constants', function () {
      var input = ['foo', 'bar'];
      var expectedResult = {
        foo: 'foo',
        bar: 'bar'
      };

      expect(Marty.createConstants(input)).to.eql(expectedResult);
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

      expect(Marty.createConstants(input)).to.eql(expectedResult);
    });
  });
});