var sinon = require('sinon');
var expect = require('chai').expect;
var warnings = require('../../warnings');
var uuid = require('../../lib/utils/uuid');
var Dispatcher = require('../../dispatcher');

describe('Container', function () {
  var container, action, id, context, expectedId;
  var defaultDispatcher, defaultActionHandler, sandbox, Marty;

  beforeEach(function () {
    id = 'foo';
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

    container = Marty.container;
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
          defaultStore = Marty.createStore(expectedStore);
        });

        it('should be able to create an instance of it', function () {
          actualStore = container.resolveStore(expectedStore.id);
          expect(actualStore).to.be.defined;
          actionCreators.addFoo(expectedFoo);
          expect(actualStore.getFoo(expectedFoo.id)).to.equal(expectedFoo);
        });

        it('should return a resolvable instance', function () {
          context = container.createContext();

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
          actualStore = container.resolveStore(expectedId);
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
          actualStore = container.resolveStore(expectedStore.displayName);
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
          actualStateSource = container.resolveStateSource(expectedStateSource.id);
          expect(actualStateSource).to.be.defined;
          actualStateSource.getFoo();
          expect(stateCall).to.be.calledOnce;
        });

        it('should return a resolvable instance', function () {
          context = container.createContext();

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
          actualStateSource = container.resolveStateSource(expectedId);
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
          actualStateSource = container.resolveStateSource(expectedStateSource.displayName);
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
          actualActionCreator = container.resolveActionCreators(expectedActionCreator.id);
          expect(actualActionCreator).to.be.defined;
          actualActionCreator.foo();
          expect(action).to.be.called;
        });

        it('should return a defaultActionCreator', function () {
          context = container.createContext();
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
          actualActionCreator = container.resolveActionCreators(expectedId);
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
          actualActionCreator = container.resolveActionCreators(expectedActionCreator.displayName);
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
});