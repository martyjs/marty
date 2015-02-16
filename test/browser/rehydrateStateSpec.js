var sinon = require('sinon');
var expect = require('chai').expect;

describe('Marty#rehydrateState()', function () {
  var serverStores, browserStores, ServerMarty, BrowserMarty;
  var store1ExpectedState, store2ExpectedState, serializedState;

  beforeEach(function () {
    store2ExpectedState = { bar: 'bar' };
    store1ExpectedState = { initial: 'store1' };

    ServerMarty = require('../../index').createInstance();
    BrowserMarty = require('../../index').createInstance();

    serverStores = createStoresFor(ServerMarty);
    browserStores = createStoresFor(BrowserMarty);

    ServerMarty.setInitialState({
      store1: store1ExpectedState,
      store2: store2ExpectedState
    });

    serializedState = ServerMarty.serializeState();
  });

  afterEach(function () {
    window.__marty = null;
  });

  describe('when there is state on the window object', function () {
    beforeEach(function () {
      eval(serializedState.toString()); // jshint ignore:line
      BrowserMarty.rehydrateState();
    });

    it('should set the stores initial state based on the serialized state', function () {
      expect(browserStores.store1.getState()).to.eql(store1ExpectedState);
      expect(browserStores.store2.getState()).to.eql(store2ExpectedState);
    });
  });

  describe('when there is only state for some stores', function () {
    beforeEach(function () {
      delete serializedState.store1;
      eval(serializedState.toString()); // jshint ignore:line
      BrowserMarty.rehydrateState();
    });

    it('should only call `getInitialState` for stores it knows about', function () {
      expect(browserStores.spies.store1).to.be.calledOnce;
      expect(browserStores.spies.store2).to.be.calledTwice;
      expect(browserStores.spies.store2).to.be.calledWith(store2ExpectedState);
    });
  });


  function createStoresFor(marty) {
    var spies = {
      store1: sinon.spy(function (state) {
        return state || {};
      }),
      store2: sinon.spy(function (state) {
        return state || {};
      })
    };

    return {
      spies: spies,
      store1: marty.createStore({
        id: 'store1',
        displayName: 'store1',
        getInitialState: spies.store1,
      }),
      store2: marty.createStore({
        id: 'store2',
        displayName: 'store2',
        getInitialState: spies.store2
      })
    };
  }
});