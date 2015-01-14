var expect = require('chai').expect;
var StateSource = require('../lib/stateSource');

describe('StateSource', function () {

  var repo;

  describe('#createStateSource()', function () {
    beforeEach(function () {
      repo = new StateSource({
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
        repo = new StateSource({
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