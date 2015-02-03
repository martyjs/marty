var sinon = require('sinon');
var _ = require('lodash-node');
var Marty = require('../index');
var expect = require('chai').expect;
var Store = require('../lib/store');
var Dispatcher = require('../dispatcher');
var ActionPayload = require('../lib/actionPayload');
var ActionHandlerNotFoundError = require('../errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('../errors/actionPredicateUndefined');

describe('Store', function () {
  var store, changeListener, listener, dispatcher, dispatchToken = 'foo', initialState = {};
  var actualAction, actualChangeListenerFunctionContext, expectedChangeListenerFunctionContext;

  beforeEach(function () {
    dispatcher = {
      register: sinon.stub().returns(dispatchToken),
      unregister: sinon.spy()
    };

    store = new Store({
      displayName: 'Test',
      dispatcher: dispatcher,
      handlers: {
        one: 'one-action',
        multiple: ['multi-1-action', 'multi-2-action'],
        where: { source: 'VIEW' },
        whereAndAction: [{source: 'VIEW'}, 'where-and-action']
      },
      one: sinon.spy(function () {
        actualAction = this.action;
      }),
      where: sinon.spy(),
      multiple: sinon.spy(),
      initialize: sinon.spy(),
      whereAndAction: sinon.spy(),
      getInitialState: sinon.stub().returns(initialState)
    });
    expectedChangeListenerFunctionContext = {};
    listener = sinon.spy(function () {
      actualChangeListenerFunctionContext = this;
    });
    changeListener = store.addChangeListener(listener, expectedChangeListenerFunctionContext);
  });

  it('should have a dispatch token', function () {
    expect(store.dispatchToken).to.equal(dispatchToken);
  });

  it('should have registered handleAction with the dispatcher', function () {
    expect(dispatcher.register).to.have.been.called;
  });

  describe('when you don\'t pass in getInitialState', function () {
    it('should throw an error', function () {
      expect(storeWithoutGetInitialState).to.throw(Error);

      function storeWithoutGetInitialState() {
        return new Store({
          foo: function () {
            return 'bar';
          }
        });
      }
    });
  });

  describe('#mixins', function () {
    describe('when you have multiple mixins', function () {
      var mixin1, mixin2;

      beforeEach(function () {
        mixin1 = {
          foo: function () { return 'bar'; }
        };

        mixin2 = {
          bar: function () { return 'baz'; }
        };

        store = new Store({
          dispatcher: dispatcher,
          getInitialState: _.noop,
          mixins: [mixin1, mixin2]
        });
      });

      it('should allow you to mixin object literals', function () {
        expect(store.foo()).to.equal('bar');
        expect(store.bar()).to.equal('baz');
      });
    });

    describe('when the mixin has handlers', function () {
      var handlerMixin;

      beforeEach(function () {
        handlerMixin = {
          handlers: {
            baz: 'BAZ'
          },
          baz: noop
        };

        store = new Store({
          dispatcher: dispatcher,
          handlers: {
            foo: 'FOO',
            bar: 'BAR'
          },
          getInitialState: _.noop,
          mixins: [handlerMixin],
          foo: noop,
          bar: noop
        });
      });

      it('should do a deep merge', function () {
        expect(store.handlers).to.include.keys('foo', 'bar', 'baz');
      });
    });
  });

  describe('#getInitialState()', function () {
    it('should be called once', function () {
      expect(store.getInitialState).to.have.been.calledOnce;
    });

    it('should set the stores state to the initial state', function () {
      expect(store.state).to.equal(initialState);
    });
  });

  describe('#state', function () {
    var newState;
    beforeEach(function () {
      newState = {};
      store.state = newState;
    });

    it('should update the state', function () {
      expect(store.state).to.equal(newState);
    });

    it('should call the change listener with the new state', function () {
      expect(listener).to.have.been.calledWith(newState);
    });
  });

  describe('#setState()', function () {
    describe('when the state has changed', function () {
      var newState;
      beforeEach(function () {
        newState = {};
        store.setState(newState);
      });

      it('should update the state', function () {
        expect(store.state).to.equal(newState);
      });

      it('should call the change listener with the new state', function () {
        expect(listener).to.have.been.calledWith(newState);
      });
    });

    describe('when the state has not changed', function () {
      beforeEach(function () {
        store.setState(store.state);
      });

      it('should not call the change linstener', function () {
        expect(listener).to.not.have.been.called;
      });
    });
  });

  describe('#addChangeListener()', function () {

    beforeEach(function () {
      store.hasChanged();
    });

    it('should call the change listener', function () {
      expect(listener).to.have.been.calledOnce;
    });

    it('should pass the state and store as the arguments', function () {
      expect(listener).to.have.been.calledWith(store.state, store);
    });

    it('should set the callbacks function context', function () {
      expect(actualChangeListenerFunctionContext).to.equal(expectedChangeListenerFunctionContext);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        changeListener.dispose();
        store.hasChanged();
      });

      it('should NOT call the change listener', function () {
        expect(listener).to.have.been.calledOnce;
      });
    });
  });

  describe('#dispose()', function () {
    var clear;

    beforeEach(function () {
      clear = sinon.spy();
    });

    describe('when you dont pass in a dispose function', function () {
      beforeEach(function () {
        store = Marty.createStore({
          dispatcher: dispatcher,
          clear: clear,
          getInitialState: function () {
            return {};
          }
        });

        store.addChangeListener(listener);
        store.hasChanged();
        store.dispose();
        store.hasChanged();
      });

      it('should call clear', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });

      it('should make store.dispatchToken undefined', function () {
        expect(store.dispatchToken).to.be.undefined;
      });
    });

    describe('when you pass in a dispose function', function () {
      var dispose;

      beforeEach(function () {
        dispose = sinon.spy();
        store = Marty.createStore({
          dispatcher: dispatcher,
          clear: clear,
          dispose: dispose,
          getInitialState: function () {
            return {};
          }
        });

        store.addChangeListener(listener);
        store.hasChanged();
        store.dispose();
        store.hasChanged();
      });

      it('should call the dispose function', function () {
        expect(dispose).to.have.been.calledOnce;
      });

      it('should call clear', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });

      it('should make store.dispatchToken undefined', function () {
        expect(store.dispatchToken).to.be.undefined;
      });
    });
  });

  describe('#createStore()', function () {
    var data = {};
    var actionType = 'foo';

    beforeEach(function () {
      store = Marty.createStore({
        handlers: {
          one: actionType,
        },
        one: sinon.spy(),
        getInitialState: _.noop
      });

      Dispatcher.getCurrent().dispatch(new ActionPayload({
        type: actionType,
        arguments: [data]
      }));
    });

    it('calls the handlers', function () {
      expect(store.one).to.have.been.calledWith(data);
    });
  });

  describe('#handlers', function () {
    describe('when the action handler is null', function () {
      it('should throw an ActionHandlerNotFoundError', function () {
        expect(createStoreWithMissingActionHandler).to.throw(ActionHandlerNotFoundError);

        function createStoreWithMissingActionHandler() {
          return new Store({
            dispatcher: dispatcher,
            handlers: {
              foo: 'FOO'
            }
          });
        }
      });
    });

    describe('when the handler action predicate is null', function () {
      it('should throw an ActionPredicateUndefinedError', function () {
        expect(createStoreWithANullActionPredicate).to.throw(ActionPredicateUndefinedError);

        function createStoreWithANullActionPredicate() {
          return new Store({
            dispatcher: dispatcher,
            handlers: {
              foo: null
            },
            foo: noop
          });
        }
      });
    });
  });

  describe('#waitFor()', function () {
    var store1, store2, store3, testActionCreators, actualResult, expectedResult, executionOrder;

    beforeEach(function () {
      executionOrder = [];
      expectedResult = 6;
    });

    describe('when I pass in an array of stores', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor([store3, store2]);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in stores as arguments', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(store3, store2);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in dispatch tokens', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(store3.dispatchToken, store2.dispatchToken);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });


    function waitFor(waitForCb) {
      var order = [];
      testActionCreators = Marty.createActionCreators({
        sum: function () {
          this.dispatch(2);
        }
      });

      store2 = Marty.createStore({
        handlers: { sum: 'SUM'},
        getInitialState: function () {
          return 0;
        },
        sum: function (value) {
          this.waitFor(store3);
          this.state += store3.getState() + value;
          order.push('store2');
        }
      });

      store1 = Marty.createStore({
        handlers: { sum: 'SUM'},
        getInitialState: function () {
          return 0;
        },
        sum: function (value) {
          waitForCb(this);
          this.state = store2.getState() + value;
          order.push('store1');
        }
      });

      store3 = Marty.createStore({
        handlers: { sum: 'SUM'},
        getInitialState: function () {
          return 0;
        },
        sum: function (value) {
          this.state += value;
          order.push('store3');
        }
      });

      testActionCreators.sum();
      actualResult = store1.getState();

      return order;
    }
  });

  describe('#handleAction()', function () {
    var data = {}, expectedAction;

    describe('when the store does not handle action type', function () {
      beforeEach(function () {
        handleAction('foo');
      });

      it('should not call any handlers', function () {
        expect(store.one).to.not.have.been.called;
        expect(store.multiple).to.not.have.been.called;
      });
    });

    describe('when the store has one action type for a handler', function () {
      beforeEach(function () {
        expectedAction = handleAction('one-action');
      });

      it('should call the action handler', function () {
        expect(store.one).to.have.been.calledOnce;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.one).to.have.been.calledWith(data);
      });

      it('should make the action accessible in the function context', function () {
        expect(actualAction).to.equal(expectedAction);
      });
    });

    describe('when the store has multiple action types for a handler', function () {
      beforeEach(function () {
        handleAction('multi-1-action');
        handleAction('multi-2-action');
      });

      it('should call the action handler', function () {
        expect(store.multiple).to.have.been.calledTwice;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.multiple).to.have.been.calledWith(data);
      });
    });

    describe('when the store has a where clause for a handler', function () {
      beforeEach(function () {
        handleActionFrom('foo', 'VIEW');
      });

      it('should call the action handler', function () {
        expect(store.where).to.have.been.called;
      });
    });

    describe('when the store has a where clause and an action type for a handler', function () {
      beforeEach(function () {
        handleActionFrom('foo', 'VIEW');
        handleAction('where-and-action');
      });

      it('should call the action handler for either', function () {
        expect(store.whereAndAction).to.have.been.calledTwice;
      });
    });

    describe('rollbacks', function () {
      var Store, ActionCreators, interimState;

      beforeEach(function () {
        Store = Marty.createStore({
          handlers: {
            add: 'ADD'
          },
          getInitialState: function () {
            return [];
          },
          add: function (user) {
            this.state.push(user);

            return function rollback() {
              this.state.splice(this.state.indexOf(user), 1);
            };
          }
        });

        ActionCreators = Marty.createActionCreators({
          add: function (user) {
            var action = this.dispatch(user);

            interimState = _.clone(Store.getState());

            action.rollback();
          }
        });
      });

      describe('when you create an action and then rollback', function () {
        var user = {name: 'foo'};

        beforeEach(function () {
          ActionCreators.add(user);
        });

        it('should call the action handler', function () {
          expect(interimState).to.eql([user]);
        });

        it('should call the action handlers rollback functions', function () {
          expect(Store.getState()).to.eql([]);
        });
      });
    });

    function handleAction(actionType) {
      var action = new ActionPayload({
        type: actionType,
        arguments: [data]
      });

      store.handleAction(action);

      return action;
    }

    function handleActionFrom(actionType, source) {
      var action = new ActionPayload({
        source: source,
        type: actionType,
        arguments: [data]
      });

      store.handleAction(action);

      return action;
    }
  });

  describe('#clear()', function () {
    describe('when you do not pass in a clear function', function () {
      beforeEach(function () {
        store = Marty.createStore({
          getInitialState: function () {
            return {};
          }
        });

        store.state['foo'] = 'bar';
        store.clear();
      });

      it('should replace the state with the original state', function () {
        expect(store.state).to.eql({});
      });
    });

    describe('when you pass in a clear function', function () {
      var clear;

      beforeEach(function () {
        clear = sinon.spy();
        store = Marty.createStore({
          clear: clear,
          getInitialState: function () {
            return {};
          }
        });

        store.state['foo'] = 'bar';
        store.clear();
      });

      it('should call the clear function', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should replace the state with the original state', function () {
        expect(store.state).to.eql({});
      });
    });
  });

  function noop() {
  }
});
