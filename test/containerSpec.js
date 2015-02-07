var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var Dispatcher = require('../dispatcher');
var Container = require('../lib/container');
var NUMBER_OF_ACTIONS_DISPATCHED = 4;

describe('Container', function () {
  var container, action, id, resolver, context;
  var defaultDispatcher, defaultActionHandler, sandbox;

  beforeEach(function () {
    id = 'foo';
    action = sinon.spy();
    sandbox = sinon.sandbox.create();
    defaultActionHandler = sinon.spy();
    defaultDispatcher = new Dispatcher();
    defaultDispatcher.isDefault = true;
    defaultDispatcher.register(defaultActionHandler);
    sandbox.stub(Dispatcher, 'getDefault').returns(defaultDispatcher);

    container = new Container();
  });

  afterEach(function () {
    sandbox.restore();
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
        resolver = container.registerActionCreators(expectedActionCreator);
      });

      it('should be able to create an instance of it', function () {
        actualActionCreator = container.resolveActionCreators(expectedActionCreator.id);
        expect(actualActionCreator).to.be.defined;
        actualActionCreator.foo();
        expect(action).to.be.called;
      });

      it('should return a resolver', function () {
        context = container.createContext();
        resolver.foo();
        resolver(context).foo();

        expect(action).to.be.calledTwice;
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

    it('should use the default dispatcher', function () {
      resolver.foo();
      expect(defaultActionHandler).to.have.callCount(NUMBER_OF_ACTIONS_DISPATCHED);
    });

    describe('when I resolve the instance for a context', function () {
      var actualActionCreators, contextActionHandler;

      beforeEach(function () {
        contextActionHandler = sinon.spy();
        context = container.createContext();
        actualActionCreators = resolver(context);
        context.dispatcher.register(contextActionHandler);
      });

      it('should still be an action creator', function () {
        actualActionCreators.foo();
        expect(action).to.be.called;
      });

      it('should not be the same instance as the factory', function () {
        expect(actualActionCreators).to.not.equal(resolver);
      });

      it('should have its context', function () {
        expect(actualActionCreators.context).to.equal(context);
      });

      it('should use the contexts dispatcher', function () {
        actualActionCreators.foo();
        expect(contextActionHandler).to.callCount(NUMBER_OF_ACTIONS_DISPATCHED);
      });

      it('should not call the default dispatcher', function () {
        actualActionCreators.foo();
        expect(defaultActionHandler).to.not.be.called;
      });
    });
  });
});