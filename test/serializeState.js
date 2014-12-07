var expect = require('chai').expect;

describe('Marty#serializeState()', function () {
  var Marty = require('../index');
  var Store1, Store2, store1ExpectedState, store2ExpectedState, serializedState;

  describe('when all the stores have names', function () {
    beforeEach(function () {
      store1ExpectedState = { initial: 'store1' };
      store2ExpectedState = { initial: 'store2' };

      Store1 = Marty.createStore({
        name: 'store1',
        getInitialState: function () {
          return store1ExpectedState;
        }
      });

      Store2 = Marty.createStore({
        name: 'store2',
        getInitialState: function () {
          return store2ExpectedState;
        }
      });

      serializedState = Marty.serializeState();
    });

    it('should serialize the state', function () {
      console.log(serializedState);
      expect(serializedState).to.equal('(window.__marty||(window.__marty={})).state=' + JSON.stringify({
        store1: store1ExpectedState,
        store2: store2ExpectedState
      }));
    });
  });

  describe('when a store doesnt have a name', function () {
    beforeEach(function () {
      beforeEach(function () {
        Store1 = Marty.createStore({});

        Store2 = Marty.createStore({
          name: 'store2',
          getInitialState: function () {
            return store2ExpectedState;
          }
        });

        serializedState = Marty.serializeState();
      });

      it('should ignore the store', function () {
        expect(serializedState).to.equal('(window.__marty||(window.__marty={})).state=' + JSON.stringify({
          store2: store2ExpectedState
        }));
      });
    });
  });
});

