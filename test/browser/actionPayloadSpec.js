var sinon = require('sinon');
var expect = require('chai').expect;
var Diagnostics = require('marty-core/lib/diagnostics');
var ActionPayload = require('marty-core/lib/actionPayload');

describe('ActionPayload', function () {
  var action, store, storeState, actionType, args, source, creator, internal;
  var id, timestamp, name, nextState, view, viewHandler, storeHandler, lastState, expectedError;

  beforeEach(function () {
    id = '123';
    internal = true;
    source = 'VIEW';
    args = [1, 2, 3];
    actionType = 'foo';
    creator = 'createFoo';
    timestamp = new Date();
    storeState = { store: 1 };
    Diagnostics.devtoolsEnabled = true;

    store = {
      action: action,
      displayName: 'foo-store',
      addChangeListener: sinon.spy(),
      getState: function () {
        return storeState;
      },
    };

    action = new ActionPayload({
      id: id,
      internal: internal,
      timestamp: timestamp,
      type: actionType,
      arguments: args,
      source: source,
      creator: creator
    });
  });

  afterEach(function () {
    Diagnostics.devtoolsEnabled = false;
  });

  describe('#toJSON()', function () {
    it('should return the action as an object literal', function () {
      expect(action.toJSON()).to.eql({
        id: id,
        stores: [],
        components: [],
        arguments: args,
        type: actionType,
        timestamp: timestamp
      });
    });
  });

  describe('#rollback()', function () {
    var handlers;

    beforeEach(function () {
      handlers = [sinon.spy(), null, sinon.spy()];

      handlers.forEach(function (handler) {
        action.addRollbackHandler(handler);
      });
    });

    it('should invoke any rollback handlers', function () {
      action.rollback();

      handlers.forEach(function (handler) {
        if (handler) {
          expect(handler).to.have.been.called;
        }
      });
    });
  });

  describe('#addComponentHandler()', function () {
    var expectedStoreId;
    beforeEach(function () {
      name = 'foo';
      expectedStoreId = 'FooStore';
      viewHandler = action.addComponentHandler({
        state: nextState,
        displayName: name
      }, {
        id: expectedStoreId
      });
    });

    it('should add the handler to the current store handler', function () {
      expect(action.components[0]).to.exist;
    });

    it('should store the name of the component', function () {
      expect(action.components[0].displayName).to.equal(name);
    });

    it('should store the state of the component', function () {
      expect(action.components[0].state).to.equal(nextState);
    });

    it('should store the store which caused the render', function () {
      expect(action.components[0].store).to.equal(expectedStoreId);
    });
  });

  describe('#addStoreHandler()', function () {
    var handlerName;

    beforeEach(function () {
      handlerName = 'storeAction';
      lastState = { before: true };
      storeState = lastState;

      storeHandler = action.addStoreHandler(store, handlerName);
    });

    it('should store the name of the store', function () {
      expect(action.stores[0].store).to.equal(store.displayName);
    });

    it('should store the name of the action handler', function () {
      expect(action.stores[0].handler).to.equal(handlerName);
    });
  });
});
