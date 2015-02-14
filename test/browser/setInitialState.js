var _ = require('underscore');
var expect = require('chai').expect;
var UnknownStoreError = require('../../errors/unknownStore');

describe('Marty#setInitialState()', function () {
  var Marty = require('../../index');
  var Store1, Store2;

  beforeEach(function () {
    Store1 = Marty.createStore({
      displayName: 'store1',
      getInitialState: function (state) {
        return state || {};
      }
    });

    Store2 = Marty.createStore({
      displayName: 'store2',
      getInitialState: function (state) {
        return state || {};
      }
    });
  });

  describe('when you pass in state for an unknown store', function () {
    it('should throw an UnknownStoreError', function () {
      expect(function () {
        Marty.setInitialState({foo:{}});
      }).to.throw(UnknownStoreError);
    });
  });

  describe('when you pass in state for a known store', function () {
    var store1State, store2State;

    beforeEach(function () {
      store1State = { foo: 'bar' };
      store2State = { bar: 'baz' };

      Marty.setInitialState({
        store1: store1State,
        store2: store2State
      });
    });

    it('should set the state of the store', function () {
      expect(Store1.getState()).to.equal(store1State);
      expect(Store2.getState()).to.equal(store2State);
    });
  });
});

