var sinon = require('sinon');
var expect = require('chai').expect;
var Action = require('../lib/action');

describe('Action', function () {
  var action, store, storeState, actionType, args, source, creator;
  var name, nextState, view, viewHandler, storeHandler, lastState, expectedError;

  beforeEach(function () {
    actionType = 'foo';
    args = [1, 2, 3];
    source = 'VIEW';
    creator = 'createFoo';
    storeState = { store: 1 };

    store = {
      action: action,
      name: 'foo-store',
      addChangeListener: sinon.spy(),
      getState: function () {
        return storeState;
      },
    };

    action = new Action({
      type: actionType,
      arguments: args,
      source: source,
      creator: creator
    });
  });

  describe('#toJSON()', function () {
    it('should return the action as an object literal', function () {
      expect(action.toJSON()).to.eql({
        type: actionType,
        source: source,
        creator: creator,
        handlers: [],
        arguments: args
      });
    });
  });

  describe('#toString()', function () {
    it('should return a string of the actions JSON representation', function () {
      expect(action.toString()).to.eql(JSON.stringify({
        type: actionType,
        source: source,
        creator: creator,
        handlers: [],
        arguments: args
      }, null, 2));
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

    it('should store the before state of the view', function () {
      expect(action.handlers[0].views[0].state.before).to.equal(lastState);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        viewHandler.dispose();
      });

      it('should store the after state of the view', function () {
        expect(action.handlers[0].views[0].state.after).to.equal(nextState);
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
      expect(action.handlers[0].store).to.equal(store.name);
    });

    it('should store the name of the action handler', function () {
      expect(action.handlers[0].name).to.equal(handlerName);
    });

    it('should store the before state of the view', function () {
      expect(action.handlers[0].state.before).to.eql(lastState);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        nextState = { after: true };
        storeState = nextState;
        storeHandler.dispose();
      });

      it('should store the after state of the view', function () {
        expect(action.handlers[0].state.after).to.eql(nextState);
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
