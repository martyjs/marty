var sinon = require('sinon');
var expect = require('chai').expect;
var Store = require('../lib/store');

describe('Store', function () {
  var store, dispatcher, dispatchToken = 'foo';

  beforeEach(function () {
    dispatcher = {
      register: sinon.stub().returns(dispatchToken)
    };

    store = new Store({
      dispatcher: dispatcher,
      handlers: {
        one: 'one-action',
        multiple: ['multi-1-action', 'multi-2-action']
      },
      one: sinon.spy(),
      multiple: sinon.spy(),
      initialize: sinon.spy()
    });
  });

  it('should call initialize once', function () {
    expect(store.initialize).to.have.been.calledOnce;
  });

  it('should have a dispatch token', function () {
    expect(store.dispatchToken).to.equal(dispatchToken);
  });

  it('should have registered handlePayload with the dispatcher', function () {
    expect(dispatcher.register).to.have.been.calledWith(store.handlePayload);
  });

  describe('when you add a change listener', function () {
    var changeListener;

    beforeEach(function () {
      changeListener = sinon.spy();
      store.addChangeListener(changeListener);
      store.hasChanged();
    });

    it('should call the change listener', function () {
      expect(changeListener).to.have.been.calledOnce;
    });

    describe('when you remove the change listener', function () {
      beforeEach(function () {
        store.removeChangeListener(changeListener);
        store.hasChanged();
      });

      it('should NOT call the change listener', function () {
        expect(changeListener).to.have.been.calledOnce;
      });
    });
  });

  describe('when a payload is received', function () {
    var data = {};

    describe('when the store does not handle action type', function () {
      beforeEach(function () {
        handlePayload('foo');
      });

      it('should not call any handlers', function () {
        expect(store.one).to.not.have.been.called;
        expect(store.multiple).to.not.have.been.called;
      });
    });

    describe('when the store has one action type for a handler', function () {
      beforeEach(function () {
        handlePayload('one-action');
      });

      it('should call the action handler', function () {
        expect(store.one).to.have.been.calledOnce;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.one).to.have.been.calledWith(data);
      });
    });

    describe('when the store has multiple aciton types for a handler', function () {
      beforeEach(function () {
        handlePayload('multi-1-action');
        handlePayload('multi-2-action');
      });

      it('should call the action handler', function () {
        expect(store.multiple).to.have.been.calledTwice;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.multiple).to.have.been.calledWith(data);
      });
    });

    function handlePayload(actionType) {
      store.handlePayload({
        actionType: actionType,
        data: data
      });
    }
  });
});