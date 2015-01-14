var expect = require('chai').expect;
var Repository = require('../lib/repository');

describe('Repository', function () {

  var repo;

  describe('#createRepository()', function () {
    beforeEach(function () {
      repo = new Repository({
        foo: 'foo'
      });
    });

    it('should apply options to instance', function () {
      expect(repo.foo).to.equal('foo');
    });
  });

  describe('#mixins', function () {
    describe('when you have multiple mixins', function () {
      beforeEach(function () {
        repo = new Repository({
          mixins: [{
            foo: function () { return 'foo'; }
          }, {
            bar: function () { return 'bar'; }
          }]
        });
      });

      it('should allow you to mixin object literals', function () {
        expect(repo.foo()).to.equal('foo');
        expect(repo.bar()).to.equal('bar');
      });
    });
  });

});