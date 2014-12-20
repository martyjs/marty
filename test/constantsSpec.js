var sinon = require('sinon');
var expect = require('chai').expect;
var constants = require('../lib/constants');

describe('Constants', function () {
  var input, actualResult;

  describe('when you pass in null', function () {
    it('should return an empty object literal', function () {
      expect(constants(null)).to.eql({});
    });
  });

  describe('when you pass in an array', function () {
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

    describe('when you invoke the constant action creator', function () {
      var actualArg, actionCreator, creatorFunction;

      beforeEach(function () {
        creatorFunction = sinon.spy();
        actionCreator = actualResult.foo(creatorFunction);
      });

      it('should create an action creator', function () {
        expect(actionCreator).to.be.instanceof(Function);
      });

      it('should have creators type as a property', function () {
        expect(actionCreator.properties.type).to.eql('foo');
      });

      describe('when I call the action creator', function () {
        var expectedArg;
        beforeEach(function () {
          expectedArg = 1;

          actionCreator(expectedArg);
        });

        it('should have called the creator function', function () {
          expect(creatorFunction).to.have.been.calledWith(expectedArg);
        });
      });
    });
  });

  describe('when you pass in an object of arrays', function () {
    beforeEach(function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: ['bam']
      };

      actualResult = constants(input);
    });

    it('should return an object of constants', function () {
      expect(Object.keys(actualResult)).to.eql(['foo', 'bim']);
      expect(Object.keys(actualResult.foo)).to.eql(['bar', 'baz']);
      expect(Object.keys(actualResult.bim)).to.eql(['bam']);
    });
  });

  describe('when I pass in a crazy combination of object literals and arrays', function () {
    beforeEach(function () {
      var input = {
        foo: ['bar', 'baz'],
        bim: {
          bam: ['what'],
          top: {
            flop: ['bop', 'hot']
          }
        }
      };

      actualResult = constants(input);
    });

    it('should return an object of constants', function () {
      expect(Object.keys(actualResult.bim)).to.eql(['bam', 'top']);
      expect(Object.keys(actualResult.bim.bam)).to.eql(['what']);
      expect(Object.keys(actualResult.bim.top.flop)).to.eql(['bop', 'hot']);
    });
  });
});