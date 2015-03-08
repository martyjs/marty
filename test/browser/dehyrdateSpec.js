var _ = require('lodash');
var expect = require('chai').expect;
var describeStyles = require('./../lib/describeStyles');

describeStyles('Marty#dehydrate()', function (styles) {
  var Marty, store1ExpectedState, storeSerializedState, serializedState, expectedFetchId;

  beforeEach(function () {
    expectedFetchId = 'FETCH';
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
          },
          testFetch: function () {
            this.fetch({
              id: expectedFetchId,
              locally: function () {
                return { foo: 'bar' };
              }
            });
          }
        }).testFetch();

        Marty.createStore({
          id: 'Store2',
          getInitialState: _.noop,
          hydrate: function () {
            return storeSerializedState;
          }
        });

        Marty.createStore({
          id: 'Store3',
          getInitialState: _.noop,
          testFetch: function () {
            this.fetch({
              id: expectedFetchId,
              locally: function () {
                return { foo: 'bar' };
              }
            });
          }
        }).testFetch();
      },
      es6: function () {
        class Store1 extends Marty.Store {
          hydrate() {
            return store1ExpectedState;
          }
          testFetch () {
            this.fetch({
              id: expectedFetchId,
              locally() {
                return { foo: 'bar' };
              }
            });
          }
        }

        class Store2 extends Marty.Store {
          hydrate() {
            return storeSerializedState;
          }
        }

        class Store3 extends Marty.Store {
          testFetch () {
            this.fetch({
              id: expectedFetchId,
              locally() {
                return { foo: 'bar' };
              }
            });
          }
        }

        Marty.register(Store1).testFetch();
        Marty.register(Store2);
        Marty.register(Store3).testFetch();
      }
    });

    serializedState = Marty.dehydrate();
  });

  it('should serialze all the stores', function () {
    expect(serializedState.toJSON()).to.eql({
      Store1: {
        fetchHistory: {
          [expectedFetchId]: true
        },
        state: store1ExpectedState
      },
      Store2: {
        fetchHistory: {},
        state: storeSerializedState
      },
      Store3: {
        fetchHistory: {
          [expectedFetchId]: true
        },
        state: {}
      }
    });
  });

  describe('#toString()', function () {
    it('should create a string that can be injected into the page', function () {
      expect(serializedState.toString()).to.equal('(window.__marty||(window.__marty={})).stores=' + JSON.stringify({
        Store1: {
          fetchHistory: {
            [expectedFetchId]: true
          },
          state: store1ExpectedState
        },
        Store2: {
          fetchHistory: {},
          state: storeSerializedState
        },
        Store3: {
          fetchHistory: {
            [expectedFetchId]: true
          },
          state: {}
        }
      }));
    });
  });
});