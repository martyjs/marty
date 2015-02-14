var _ = require('underscore');
var expect = require('chai').expect;

describe('Marty#serializeState()', function () {
  var Store1, Store2, Store3, Marty;
  var store1ExpectedState, storeSerializedState, serializedState;

  beforeEach(function () {
    storeSerializedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };
    Marty = require('../../index').createInstance();
    Store1 = Marty.createStore({
      id: 'store1',
      displayName: 'store1',
      getInitialState: _.noop,
      serialize: function () {
        return store1ExpectedState;
      }
    });

    Store2 = Marty.createStore({
      id: 'store2',
      displayName: 'store2',
      getInitialState: _.noop,
      serialize: function () {
        return storeSerializedState;
      }
    });

    Store3 = Marty.createStore({
      id: 'store3',
      getInitialState: _.noop
    });
    serializedState = Marty.serializeState();
  });

  it('should serialze all the stores', function () {
    expect(serializedState.toJSON()).to.eql({
      store1: store1ExpectedState,
      store2: storeSerializedState,
      store3: {}
    });
  });

  describe('#toString()', function () {
    it('should create a string that can be injected into the page', function () {
      expect(serializedState.toString()).to.equal('(window.__marty||(window.__marty={})).state=' + JSON.stringify({
        store1: store1ExpectedState,
        store2: storeSerializedState,
        store3: {}
      }));
    });
  });
});