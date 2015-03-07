var _ = require('lodash');
var expect = require('chai').expect;
var describeStyles = require('./../lib/describeStyles');

describeStyles('Marty#dehydrate()', function (styles) {
  var Marty, store1ExpectedState, storeSerializedState, serializedState;

  beforeEach(function () {
    storeSerializedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };
    Marty = require('../../marty').createInstance();
    styles({
      classic: function () {
        Marty.createStore({
          id: 'Store1',
          getInitialState: _.noop,
          hydrate: function () {
            return store1ExpectedState;
          }
        });

        Marty.createStore({
          id: 'Store2',
          getInitialState: _.noop,
          hydrate: function () {
            return storeSerializedState;
          }
        });

        Marty.createStore({
          id: 'Store3',
          getInitialState: _.noop
        });
      },
      es6: function () {
        class Store1 extends Marty.Store {
          hydrate() {
            return store1ExpectedState;
          }
        }

        class Store2 extends Marty.Store {
          hydrate() {
            return storeSerializedState;
          }
        }

        class Store3 extends Marty.Store {
        }

        Marty.register(Store1);
        Marty.register(Store2);
        Marty.register(Store3);
      }
    });

    serializedState = Marty.dehydrate();
  });

  it('should serialze all the stores', function () {
    expect(serializedState.toJSON()).to.eql({
      Store1: store1ExpectedState,
      Store2: storeSerializedState,
      Store3: {}
    });
  });

  describe('#toString()', function () {
    it('should create a string that can be injected into the page', function () {
      expect(serializedState.toString()).to.equal('(window.__marty||(window.__marty={})).state=' + JSON.stringify({
        Store1: store1ExpectedState,
        Store2: storeSerializedState,
        Store3: {}
      }));
    });
  });
});