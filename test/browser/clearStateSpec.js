var expect = require('chai').expect;

describe('Marty#clearState()', function () {
  var Marty = require('../../browser');
  var Store1, Store2;

  beforeEach(function () {
    Store1 = Marty.createStore({
      id: 'clearState1',
      getInitialState: function () {
        return {};
      }
    });

    Store2 = Marty.createStore({
      id: 'clearState2',
      getInitialState: function () {
        return {};
      }
    });

    Marty.replaceState({
      clearState1: { foo: 'bar' },
      clearState2: { bar: 'baz' }
    });

    Marty.clearState();
  });

  it('should reset the store state to its initial state', function () {
    expect(Store1.getState()).to.eql({});
    expect(Store2.getState()).to.eql({});
  });
});

