var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;

describe('Marty#addStoreChangeListener()', function () {
  var Marty, Store1, Store2, listener, disposable;

  beforeEach(function () {
    Marty = require('../../index').createInstance();
    listener = sinon.spy();

    Store1 = Marty.createStore({
      id: 'store1',
      displayName: 'store1',
      getInitialState: _.noop
    });

    Store2 = Marty.createStore({
      id: 'store2',
      displayName: 'store2',
      getInitialState: _.noop
    });

    disposable = Marty.addStoreChangeListener(listener);
  });

  describe('when the store changes', function () {
    var store1State, store2State;

    beforeEach(function () {
      store1State = { foo: 'bar' };
      store2State = { bar: 'baz '};

      Store1.replaceState(store1State);
      Store2.replaceState(store2State);
    });

    it('should invoke any listeners', function () {
      expect(listener).to.have.been.calledWith(store1State, Store1);
      expect(listener).to.have.been.calledWith(store2State, Store2);
    });
  });

  describe('#dispose()', function () {
    beforeEach(function () {
      Store1.replaceState({});
      disposable.dispose();
      Store1.replaceState({});
    });

    it('should stop listening', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });
});