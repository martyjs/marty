var sinon = require('sinon');
var expect = require('chai').expect;
var Diagnostics = require('../../lib/diagnostics');
var ActionPayload = require('../../lib/actionPayload');

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
        type: actionType,
        source: source,
        creator: creator,
        internal: internal,
        handlers: [],
        error: null,
        status: 'PENDING',
        timestamp: timestamp,
        arguments: args
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

  describe('#addViewHandler()', function () {
    beforeEach(function () {
      name = 'foo',
      lastState = {};
      view = {
        state: nextState
      };
      action.addStoreHandler(store, 'bar');
      viewHandler = action.addViewHandler(name, view, lastState);
    });

    it('should add the handler to the current store handler', function () {
      expect(action.handlers[0].views[0]).to.exist;
    });

    it('should store the name of the view', function () {
      expect(action.handlers[0].views[0].name).to.equal(name);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        viewHandler.dispose();
      });

      it('should store the after state of the view', function () {
        expect(action.handlers[0].views[0].state).to.equal(nextState);
      });
    });

    describe('#failed()', function () {
      var expectedError;

      beforeEach(function () {
        expectedError = new Error();

        viewHandler.failed(expectedError);
      });

      it('should store the thrown error', function () {
        expect(action.handlers[0].views[0].error).to.equal(expectedError);
      });
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
      expect(action.handlers[0].store).to.equal(store.displayName);
    });

    it('should store the name of the action handler', function () {
      expect(action.handlers[0].name).to.equal(handlerName);
    });


    describe('#dispose()', function () {
      beforeEach(function () {
        nextState = { after: true };
        storeState = nextState;
        storeHandler.dispose();
      });

      it('should store the after state of the view', function () {
        expect(action.handlers[0].state).to.eql(nextState);
      });
    });

    describe('#failed()', function () {
      beforeEach(function () {
        expectedError = new Error();
        storeHandler.failed(expectedError);
      });

      it('should store the thrown error', function () {
        expect(action.handlers[0].error).to.equal(expectedError);
      });
    });
  });
});
