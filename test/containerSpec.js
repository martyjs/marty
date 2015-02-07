var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var uuid = require('../lib/utils/uuid');
var Dispatcher = require('../dispatcher');
var Container = require('../lib/container');
var NUMBER_OF_ACTIONS_DISPATCHED = 4;

describe('Container', function () {
  var container, action, id, resolver, context, expectedId;
  var defaultDispatcher, defaultActionHandler, sandbox;

  beforeEach(function () {
    id = 'foo';
    action = sinon.spy();
    expectedId = uuid.generate();
    sandbox = sinon.sandbox.create();
    defaultActionHandler = sinon.spy();
    defaultDispatcher = new Dispatcher();
    defaultDispatcher.isDefault = true;
    defaultDispatcher.register(defaultActionHandler);
    sandbox.stub(uuid, 'generate').returns(expectedId);
    sandbox.stub(Dispatcher, 'getDefault').returns(defaultDispatcher);

    container = new Container();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('stores', function () {
    var expectedStore, expectedFoo, actualStore, actionCreators, storeResolver;

    beforeEach(function () {
      expectedFoo = { id: 123, foo: 'bar '};

      actionCreators = container.registerActionCreators({
        id: 'registerStoreActionCreators',
        addFoo: function (foo) {
          this.dispatch(foo);
        }
      });

      expectedStore = {
        id: id,
        displayName: 'Foo',
        handlers: {
          addFoo: 'ADD_FOO'
        },
        addFoo: function (foo) {
          this.state[foo.id] = foo;
        },
        getFoo: function (id) {
          return this.state[id];
        },
        getInitialState: function () {
          return {};
        }
      };
    });

    describe('registerStore', function () {

      describe('when I register a store with an Id', function () {
        beforeEach(function () {
          storeResolver = container.registerStore(expectedStore);
        });

        it('should be able to create an instance of it', function () {
          actualStore = container.resolveStore(expectedStore.id);
          expect(actualStore).to.be.defined;
          actionCreators.addFoo(expectedFoo);
          expect(actualStore.getFoo(expectedFoo.id)).to.equal(expectedFoo);
        });

        it('should return a resolver', function () {
          context = container.createContext();

          actionCreators(context).addFoo(expectedFoo);
          expect(storeResolver(context).getFoo(expectedFoo.id)).to.equal(expectedFoo);
          expect(storeResolver.getFoo(expectedFoo.id)).to.be.undefined;
        });
      });

      describe('when the store doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedStore.id;
          delete expectedStore.displayName;
          container.registerStore(expectedStore);
        });

        it('should generate an Id for it', function () {
          actualStore = container.resolveStore(expectedId);
          expect(actualStore).to.be.defined;
          expect(actualStore.getFoo).to.be.defined;
        });
      });

      describe('when the store only has a display name', function () {
        beforeEach(function () {
          delete expectedStore.id;
          container.registerStore(expectedStore);
        });

        it('should use the displayName as an Id', function () {
          actualStore = container.resolveStore(expectedStore.displayName);
          expect(actualStore).to.be.defined;
          expect(actualStore.getFoo).to.be.defined;
        });
      });
    });

    describe('createStoreResolver', function () {
      beforeEach(function () {
        container.registerStore(expectedStore);

        storeResolver = container.createStoreResolver(id);
      });

      it('should be a function', function () {
        expect(_.isFunction(storeResolver)).to.be.true;
      });

      it('should still be a store', function () {
        actionCreators.addFoo(expectedFoo);
        expect(storeResolver.getFoo(expectedFoo.id)).to.equal(expectedFoo);
      });

      describe('when I resolve the instance for a context', function () {
        var actualStore;

        beforeEach(function () {
          context = container.createContext();
          actualStore = storeResolver(context);
        });

        it('should still be a store', function () {
          actionCreators(context).addFoo(expectedFoo);
          expect(actualStore.getFoo(expectedFoo.id)).to.equal(expectedFoo);
        });

        it('should not use the default dispatcher', function () {
          actionCreators(context).addFoo(expectedFoo);
          expect(storeResolver.getFoo(expectedFoo.id)).to.be.undefined;
        });

        it('should not be the same instance as the resolver', function () {
          expect(actualStore).to.not.equal(storeResolver);
        });

        it('should have its context', function () {
          expect(actualStore.context).to.equal(context);
        });
      });
    });
  });

  describe('state sources', function () {
    var expectedStateSource, stateCall, actualStateSource, stateSourceResolver;

    beforeEach(function () {
      stateCall = sinon.spy();

      expectedStateSource = {
        id: id,
        getFoo: stateCall,
        displayName: 'StateSource'
      };
    });

    describe('registerStateSource', function () {

      describe('when I register a state source with an Id', function () {
        beforeEach(function () {
          stateSourceResolver = container.registerStateSource(expectedStateSource);
        });

        it('should be able to create an instance of it', function () {
          actualStateSource = container.resolveStateSource(expectedStateSource.id);
          expect(actualStateSource).to.be.defined;
          actualStateSource.getFoo();
          expect(stateCall).to.be.calledOnce;
        });

        it('should return a resolver', function () {
          context = container.createContext();

          stateSourceResolver(context).getFoo();
          expect(stateCall).to.be.calledOnce;
        });
      });

      describe('when the state source doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedStateSource.id;
          delete expectedStateSource.displayName;
          container.registerStateSource(expectedStateSource);
        });

        it('should generate an Id for it', function () {
          actualStateSource = container.resolveStateSource(expectedId);
          expect(actualStateSource).to.be.defined;
          expect(actualStateSource.getFoo).to.be.defined;
        });
      });

      describe('when the state source only has a display name', function () {
        beforeEach(function () {
          delete expectedStateSource.id;
          container.registerStateSource(expectedStateSource);
        });

        it('should use the displayName as an Id', function () {
          actualStateSource = container.resolveStateSource(expectedStateSource.displayName);
          expect(actualStateSource).to.be.defined;
          expect(actualStateSource.getFoo).to.be.defined;
        });
      });
    });

    describe('createStateSourceResolver', function () {
      beforeEach(function () {
        container.registerStateSource(expectedStateSource);

        stateSourceResolver = container.createStateSourceResolver(id);
      });

      it('should be a function', function () {
        expect(_.isFunction(stateSourceResolver)).to.be.true;
      });

      it('should still be a state source', function () {
        stateSourceResolver.getFoo();
        expect(stateCall).to.be.calledOnce;
      });

      describe('when I resolve the instance for a context', function () {
        var actualStateSource;

        beforeEach(function () {
          context = container.createContext();
          actualStateSource = stateSourceResolver(context);
        });

        it('should still be a state source', function () {
          stateSourceResolver(context).getFoo();
          expect(stateCall).to.be.calledOnce;
        });

        it('should not be the same instance as the resolver', function () {
          expect(actualStateSource).to.not.equal(stateSourceResolver);
        });

        it('should have its context', function () {
          expect(actualStateSource.context).to.equal(context);
        });
      });
    });
  });

  describe('action creators', function () {
    describe('registerActionCreators', function () {
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
          container.registerActionCreators(expectedActionCreator);
        });

        it('should generate an Id for it', function () {
          actualActionCreator = container.resolveActionCreators(expectedId);
          expect(actualActionCreator).to.be.defined;
          actualActionCreator.foo();
          expect(action).to.be.called;
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

        it('should not be the same instance as the resolver', function () {
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
});