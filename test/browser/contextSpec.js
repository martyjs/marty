var sinon = require('sinon');
var expect = require('chai').expect;
var Context = require('../../lib/context');
var Instances = require('../../lib/instances');

describe('Context', function () {
  var context;

  describe('#dispose()', function () {
    var disposableFoo1, disposableFoo2, disposableBar;
    var disposeInstance;

    beforeEach(function () {
      context = new Context();

      disposableFoo1 = { dispose: sinon.spy() };
      disposableFoo2 = { dispose: sinon.spy() };
      disposableBar = { dispose: sinon.spy() };

      context.instances['Bar'] = [disposableBar];
      context.instances['Foo'] = [disposableFoo1, disposableFoo2];

      disposeInstance = sinon.spy(Instances, 'dispose');

      context.dispose();
    });

    afterEach(function () {
      if (disposeInstance) {
        disposeInstance.restore();
      }
    });

    it('should have removed the instance', function () {
      expect(disposeInstance).to.be.calledWith(context);
    });

    it('will dispose of all instances', function () {
      [disposableFoo1, disposableFoo2, disposableBar].forEach(function (disposable) {
        expect(disposable.dispose).to.be.calledOnce;
      });
    });

    it('will delete reference to the dispatcher', function () {
      expect(context.dispatcher).to.not.exist;
    });

    it('will delete reference to the instances', function () {
      expect(context.instances).to.not.exist;
    });
  });
});