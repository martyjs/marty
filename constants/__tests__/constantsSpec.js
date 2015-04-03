import constants from '../index';
import { expect } from 'chai';

describe('Constants', function() {
  let input, actualResult;

  describe('when you pass in null', function() {
    it('should return an empty object literal', function() {
      expect(constants(null)).to.eql({});
    });
  });

  describe('when you pass in an array', function() {
    beforeEach(function() {
      input = ['foo', 'bar'];

      actualResult = constants(input);
    });

    it('should create an object with the given keys', function() {
      expect(Object.keys(actualResult)).to.eql(typesWithletiations(['foo', 'bar']));
    });

    it('should create an identical string for each key', function() {
      input.forEach(key => {
        expect(typeof actualResult[key] === 'string').to.be.true
        expect(actualResult[key] === key).to.be.true
      });
    });

    it('should add a key_{DONE} key for each key', function() {
      input.forEach(key => expect(typeof actualResult[`${key}_DONE`] === 'string').to.be.true);
    });

    it('should add a key_{FAILED} key for each key', function() {
      input.forEach(key => expect(typeof actualResult[`${key}_FAILED`] === 'string').to.be.true);
    });

    it('should add a key_{STARTING} key for each key', function() {
      input.forEach(key => expect(typeof actualResult[`${key}_STARTING`] === 'string').to.be.true);
    });
  });

  describe('when you pass in an object of arrays', function() {
    beforeEach(function() {
      let input = {
        foo: ['bar', 'baz'],
        bim: ['bam']
      };

      actualResult = constants(input);
    });

    it('should return an object of constants', function() {
      expect(Object.keys(actualResult)).to.eql(['foo', 'bim']);
      expect(Object.keys(actualResult.foo)).to.eql(typesWithletiations(['bar', 'baz']));
      expect(Object.keys(actualResult.bim)).to.eql(typesWithletiations(['bam']));
    });
  });

  describe('when I pass in a crazy combination of object literals and arrays', function() {
    beforeEach(function() {
      let input = {
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

    it('should return an object of constants', function() {
      expect(Object.keys(actualResult.bim)).to.eql(['bam', 'top']);
      expect(Object.keys(actualResult.bim.bam)).to.eql(typesWithletiations(['what']));
      expect(Object.keys(actualResult.bim.top.flop)).to.eql(typesWithletiations(['bop', 'hot']));
    });
  });

  function typesWithletiations(types) {
    return types.map(type => [type, `${type}_DONE`, `${type}_FAILED`, `${type}_STARTING`]).
      reduce((a,b) => a.concat(b));
  }
});
