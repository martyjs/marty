var expect = require('chai').expect;

describe('Marty#serializeState()', function () {
  var Marty = require('../index');
  var Store1, Store2, Store3, store1ExpectedState, storeSerializedState, serializedState;

  beforeEach(function () {
    storeSerializedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };

    Store1 = Marty.createStore({
      name: 'store1',
      serialize: function () {
        return store1ExpectedState;
      }
    });

    Store2 = Marty.createStore({
      name: 'store2',
      serialize: function () {
        return storeSerializedState;
      }
    });

    Store3 = Marty.createStore({});
    serializedState = Marty.serializeState();
  });

  it('should serialize all stores', function () {
    expect(serializedState).to.equal('(window.__marty||(window.__marty={})).state=' + JSON.stringify({
      store1: store1ExpectedState,
      store2: storeSerializedState
    }));
  });
});