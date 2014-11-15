var sinon = require('sinon');
var expect = require('chai').expect;
var Store = require('../lib/store');

describe('Store', function () {
  var store, changeListener, listener, dispatcher, dispatchToken = 'foo', initialState = {};
  var actualAction, actualChangeListenerFunctionContext, expectedChangeListenerFunctionContext;

  beforeEach(function () {
    dispatcher = {
      register: sinon.stub().returns(dispatchToken)
    };

    store = new Store({
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

  describe('#mixins', function () {
    it('should allow you to mixin object literals');
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

    it('should pass the state as the first argument to the callback');
    it('should pass the store as the second argument to the callback');

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

  describe('#createStore()', function () {
    var data = {};
    var actionType = 'foo';
    var Marty = require('../index');

    beforeEach(function () {
      store = Marty.createStore({
        handlers: {
          one: actionType,
        },
        one: sinon.spy()
      });

      Marty.dispatcher.dispatch({
        arguments: [data],
        type: actionType
      });
    });

    it('calls the handlers', function () {
      expect(store.one).to.have.been.calledWith(data);
    });
  });

  describe('#waitFor()', function () {
    describe('when I pass in an array of stores', function () {
      it('should wait for the specified stores to complete');
    });

    describe('when I pass in stores as arguments', function () {
      it('should wait for the specified stores to complete');
    });
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

    function handleAction(actionType) {
      var action = {
        type: actionType,
        arguments: [data]
      };

      store.handleAction(action);

      return action;
    }

    function handleActionFrom(actionType, source) {
      var action = {
        source: source,
        type: actionType,
        arguments: [data]
      };

      store.handleAction(action);

      return action;
    }
  });
});