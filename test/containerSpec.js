var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var Container = require('../lib/container');

describe('Container', function () {
  var container, action, id;

  beforeEach(function () {
    id = 'foo';
    action = sinon.spy();
    container = new Container();
  });

  describe('registerActionCreator', function () {
    var expectedActionCreator, actualActionCreator;

    beforeEach(function () {
      expectedActionCreator = {
        id: id,
        displayName: 'Foo',
        foo: action
      };
    });

    describe('when I register an action creator with an Id', function () {
      beforeEach(function () {
        container.registerActionCreators(expectedActionCreator);
      });

      it('should be able to create an instance of it', function () {
        actualActionCreator = container.resolveActionCreators(expectedActionCreator.id);
        expect(actualActionCreator).to.be.defined;
        actualActionCreator.foo();
        expect(action).to.be.called;
      });
    });

    describe('when the action creator doesnt have an Id or displayName', function () {
      beforeEach(function () {
        delete expectedActionCreator.id;
        delete expectedActionCreator.displayName;
      });

      it('should throw an error', function () {
        expect(function () {
          container.registerActionCreators(expectedActionCreator);
        }).to.throw(Error);
      });
    });

    describe('when the action creator only has a display name', function () {
      beforeEach(function () {
        delete expectedActionCreator.id;
        container.registerActionCreators(expectedActionCreator);
      });

      it('should use the displayName as an Id', function () {
        actualActionCreator = container.resolveActionCreators(expectedActionCreator.displayName);
        expect(actualActionCreator).to.be.defined;
        actualActionCreator.foo();
        expect(action).to.be.called;
      });
    });
  });

  describe('createActionCreatorResolver', function () {
    var resolver;

    beforeEach(function () {
      container.registerActionCreators({
        id: id,
        foo: action
      });

      resolver = container.createActionCreatorsResolver(id);
    });

    it('should be a function', function () {
      expect(_.isFunction(resolver)).to.be.true;
    });

    it('should still be an action creator', function () {
      resolver.foo();
      expect(action).to.be.called;
    });

    describe('when I resolve the instance for a context', function () {
      var context, actualActionCreators;

      beforeEach(function () {
        context = container.createContext();
        actualActionCreators = resolver(context);
      });

      it('should still be an action creator', function () {
        actualActionCreators.foo();
        expect(action).to.be.called;
      });

      it('should not be the same instance as the factory', function () {
        expect(actualActionCreators).to.not.equal(resolver);
      });
    });
  });
});