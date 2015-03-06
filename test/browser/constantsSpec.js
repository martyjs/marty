var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var warnings = require('../../lib/warnings');
var constants = require('../../lib/constants');

describe('Constants', function () {
  var input, actualResult, actionCreatorContext;

  beforeEach(function () {
    actionCreatorContext = { dispatch: sinon.spy() };

    warnings.invokeConstant = false;
  });

  afterEach(function () {
    warnings.invokeConstant = true;
  });

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
      describe('when you pass in a function', function () {
        var actionCreator, creatorFunction;

        beforeEach(function () {
          creatorFunction = sinon.spy(function (arg) {
            this.dispatch(arg);
          });
          actionCreator = actualResult.foo(creatorFunction);
        });

        it('should create an action creator', function () {
          expect(actionCreator).to.be.instanceof(Function);
        });

        describe('when I call the action creator', function () {
          var expectedArg;
          beforeEach(function () {
            expectedArg = 1;

            actionCreator.call(actionCreatorContext, expectedArg);
          });

          it('should have called the creator function', function () {
            expect(actionCreatorContext.dispatch).to.have.been.calledWith('foo', expectedArg);
          });
        });
      });

      describe('when I dont pass in a function as the first argument', function () {
        var actionCreator;

        beforeEach(function () {
          actionCreator = actualResult.foo();
        });

        it('should create an action creator', function () {
          expect(actionCreator).to.be.instanceof(Function);
        });

        describe('when I call the action creator', function () {
          var expectedArg1, expectedArg2;
          beforeEach(function () {
            expectedArg1 = 1;
            expectedArg2 = 'bar';

            actionCreator.call(actionCreatorContext, expectedArg1, expectedArg2);
          });

          it('should have called the creator function', function () {
            expect(actionCreatorContext.dispatch).to.have.been.calledWith('foo', expectedArg1, expectedArg2);
          });
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