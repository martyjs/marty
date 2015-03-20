var sinon = require('sinon');
var expect = require('chai').expect;
var warnings = require('../../lib/warnings');
var uuid = require('../../lib/utils/uuid');
var Dispatcher = require('../../lib/dispatcher');

describe('Registry', function () {
  var registry, action, query, id, context, expectedId;
  var defaultDispatcher, defaultActionHandler, sandbox, Marty;

  beforeEach(function () {
    id = 'foo';
    query = sinon.spy();
    action = sinon.spy();
    expectedId = uuid.generate();
    sandbox = sinon.sandbox.create();
    defaultActionHandler = sinon.spy();
    defaultDispatcher = new Dispatcher();
    defaultDispatcher.isDefault = true;
    Marty = require('../../marty').createInstance();
    defaultDispatcher.register(defaultActionHandler);
    sandbox.stub(uuid, 'generate').returns(expectedId);
    sandbox.stub(Dispatcher, 'getDefault').returns(defaultDispatcher);

    registry = Marty.registry;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('when there are two classes with the same Id', function () {
    beforeEach(function () {
      expectedId = 'Foo';

      Marty.createStore({ id: expectedId });
    });

    it('should throw an error when you try to register the second class', function () {
      expect(registerSecondClass).to.throw(Error);

      function registerSecondClass() {
        Marty.createStore({ id: expectedId });
      }
    });
  });

  describe('stores', function () {
    var expectedStore, expectedFoo, actualStore, actionCreators, defaultStore;


    beforeEach(function () {
      expectedFoo = { id: 123, foo: 'bar'};

      actionCreators = Marty.createActionCreators({
        id: 'registerStoreActionCreators',
        addFoo: function (foo) {
          this.dispatch('ADD_FOO', foo);
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
          defaultStore = Marty.createStore(expectedStore);
        });

        it('should be able to create an instance of it', function () {
          actualStore = registry.resolveStore(expectedStore.id);
          expect(actualStore).to.be.defined;
          actionCreators.addFoo(expectedFoo);
          expect(actualStore.getFoo(expectedFoo.id)).to.equal(expectedFoo);
        });

        it('should return a resolvable instance', function () {
          context = registry.createContext();

          actionCreators.for(context).addFoo(expectedFoo);
          expect(defaultStore.for(context).getFoo(expectedFoo.id)).to.equal(expectedFoo);
          expect(defaultStore.getFoo(expectedFoo.id)).to.be.undefined;
        });
      });

      describe('when the store doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedStore.id;
          delete expectedStore.displayName;
          warnings.classDoesNotHaveAnId = false;
          Marty.createStore(expectedStore);
        });

        it('should generate an Id for it', function () {
          actualStore = registry.resolveStore(expectedId);
          expect(actualStore).to.be.defined;
          expect(actualStore.getFoo).to.be.defined;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });

      describe('when the store only has a display name', function () {
        beforeEach(function () {
          delete expectedStore.id;
          warnings.classDoesNotHaveAnId = false;
          Marty.createStore(expectedStore);
        });

        it('should use the displayName as an Id', function () {
          actualStore = registry.resolveStore(expectedStore.displayName);
          expect(actualStore).to.be.defined;
          expect(actualStore.getFoo).to.be.defined;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });
    });
  });

  describe('state sources', function () {
    var expectedStateSource, stateCall, actualStateSource, defaultStateSource;

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
          defaultStateSource = Marty.createStateSource(expectedStateSource);
        });

        it('should be able to create an instance of it', function () {
          actualStateSource = registry.resolveStateSource(expectedStateSource.id);
          expect(actualStateSource).to.be.defined;
          actualStateSource.getFoo();
          expect(stateCall).to.be.calledOnce;
        });

        it('should return a resolvable instance', function () {
          context = registry.createContext();

          defaultStateSource.for(context).getFoo();
          expect(stateCall).to.be.calledOnce;
        });
      });

      describe('when the state source doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedStateSource.id;
          delete expectedStateSource.displayName;
          warnings.classDoesNotHaveAnId = false;
          Marty.createStateSource(expectedStateSource);
        });

        it('should generate an Id for it', function () {
          actualStateSource = registry.resolveStateSource(expectedId);
          expect(actualStateSource).to.be.defined;
          expect(actualStateSource.getFoo).to.be.defined;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });

      describe('when the state source only has a display name', function () {
        beforeEach(function () {
          delete expectedStateSource.id;
          warnings.classDoesNotHaveAnId = false;
          Marty.createStateSource(expectedStateSource);
        });

        it('should use the displayName as an Id', function () {
          actualStateSource = registry.resolveStateSource(expectedStateSource.displayName);
          expect(actualStateSource).to.be.defined;
          expect(actualStateSource.getFoo).to.be.defined;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });
    });
  });

  describe('action creators', function () {
    describe('registerActionCreators', function () {
      var expectedActionCreator, actualActionCreator, defaultActionCreator;

      beforeEach(function () {
        expectedActionCreator = {
          id: id,
          displayName: 'Foo',
          foo: action
        };
      });

      describe('when I register an action creator with an Id', function () {
        beforeEach(function () {
          defaultActionCreator = Marty.createActionCreators(expectedActionCreator);
        });

        it('should be able to create an instance of it', function () {
          actualActionCreator = registry.resolveActionCreators(expectedActionCreator.id);
          expect(actualActionCreator).to.be.defined;
          actualActionCreator.foo();
          expect(action).to.be.called;
        });

        it('should return a defaultActionCreator', function () {
          context = registry.createContext();
          defaultActionCreator.foo();
          defaultActionCreator.for(context).foo();

          expect(action).to.be.calledTwice;
        });
      });

      describe('when the action creator doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedActionCreator.id;
          delete expectedActionCreator.displayName;
          warnings.classDoesNotHaveAnId = false;
          Marty.createActionCreators(expectedActionCreator);
        });

        it('should generate an Id for it', function () {
          actualActionCreator = registry.resolveActionCreators(expectedId);
          expect(actualActionCreator).to.be.defined;
          actualActionCreator.foo();
          expect(action).to.be.called;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });

      describe('when the action creator only has a display name', function () {
        beforeEach(function () {
          delete expectedActionCreator.id;
          warnings.classDoesNotHaveAnId = false;
          Marty.createActionCreators(expectedActionCreator);
        });

        it('should use the displayName as an Id', function () {
          actualActionCreator = registry.resolveActionCreators(expectedActionCreator.displayName);
          expect(actualActionCreator).to.be.defined;
          actualActionCreator.foo();
          expect(action).to.be.called;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });
    });
  });

  describe('queries', function () {
    describe('registerQueries', function () {
      var expectedQueries, actualQueries, defaultQueries;

      beforeEach(function () {
        expectedQueries = {
          id: id,
          displayName: 'Foo',
          foo: query
        };
      });

      describe('when I register queries with an Id', function () {
        beforeEach(function () {
          defaultQueries = Marty.createQueries(expectedQueries);
        });

        it('should be able to create an instance of it', function () {
          actualQueries = registry.resolveQueries(expectedQueries.id);
          expect(actualQueries).to.be.defined;
          actualQueries.foo();
          expect(query).to.be.called;
        });

        it('should return a defaultQueries', function () {
          context = registry.createContext();
          defaultQueries.foo();
          defaultQueries.for(context).foo();

          expect(query).to.be.calledTwice;
        });
      });

      describe('when queries doesnt have an Id or displayName', function () {
        beforeEach(function () {
          delete expectedQueries.id;
          delete expectedQueries.displayName;
          warnings.classDoesNotHaveAnId = false;
          Marty.createQueries(expectedQueries);
        });

        it('should generate an Id for it', function () {
          actualQueries = registry.resolveQueries(expectedId);
          expect(actualQueries).to.be.defined;
          actualQueries.foo();
          expect(query).to.be.called;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });

      describe('when queries only has a display name', function () {
        beforeEach(function () {
          delete expectedQueries.id;
          warnings.classDoesNotHaveAnId = false;
          Marty.createQueries(expectedQueries);
        });

        it('should use the displayName as an Id', function () {
          actualQueries = registry.resolveQueries(expectedQueries.displayName);
          expect(actualQueries).to.be.defined;
          actualQueries.foo();
          expect(query).to.be.called;
        });

        afterEach(function () {
          warnings.classDoesNotHaveAnId = true;
        });
      });
    });
  });
});