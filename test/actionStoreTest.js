var sinon = require('sinon');
var expect = require('chai').expect;
var uuid = require('../lib/utils/uuid');
var dispatch = require('./lib/dispatch');
var ActionPayload = require('../lib/actionPayload');
var ActionStore = require('../lib/stores/actionsStore');
var ActionConstants = require('../lib/internalConstants').Actions;

describe('ActionStore', function () {
  var listener, expectedActionType, token, actualAction, expectedArguments;

  beforeEach(function () {
    token = uuid();
    listener = sinon.spy();
    expectedActionType = 'FOO_BAR';
  });

  afterEach(function () {
    ActionStore.dispose();
  });

  describe('#Marty.getAction()', function () {
    var Marty = require('../index');

    beforeEach(function () {
      dispatchStarting();
      actualAction = Marty.getAction(token);
    });

    it('should return the action', function () {
      expect(actualAction).to.exist;
    });
  });

  describe('when an action starts', function () {
    beforeEach(function () {
      expectedArguments = [1, 2];
      ActionStore.addChangeListener(listener);
      dispatchStarting(expectedArguments);
      actualAction = ActionStore.getAction(token);
    });

    it('should add the action', function () {
      expect(actualAction).to.exist;
    });

    it('should have a \'pending\' status', function () {
      expect(actualAction.status).to.equal('pending');
    });

    it('should have the actions type', function () {
      expect(actualAction.type).to.equal(expectedActionType);
    });

    it('should have the actions token', function () {
      expect(actualAction.token).to.equal(token);
    });

    it('should emit a change to all listeners', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });

  describe('when an action fails', function () {
    var expectedError;

    beforeEach(function () {
      expectedError = new Error();
      dispatchStarting();

      ActionStore.addChangeListener(listener);
      dispatchError(expectedError);
      actualAction = ActionStore.getAction(token);
    });

    it('should have a \'failed\' status', function () {
      expect(actualAction.status).to.equal('failed');
    });

    it('should have the error', function () {
      expect(actualAction.error).to.equal(expectedError);
    });

    it('should emit a change to all listeners', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });

  describe('when an action is done', function () {
    beforeEach(function () {
      dispatchStarting();
      ActionStore.addChangeListener(listener);
      dispatchDone();
      actualAction = ActionStore.getAction(token);
    });

    it('should have a \'done\' status', function () {
      expect(actualAction.status).to.equal('done');
    });

    it('should say the action is done', function () {
      expect(actualAction.done).to.be.true;
    });

    it('should emit a change to all listeners', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });

  function dispatchDone() {
    dispatch(new ActionPayload({
      type: ActionConstants.ACTION_DONE,
      arguments: [token]
    }));
  }

  function dispatchError(error) {
    dispatch(new ActionPayload({
      type: ActionConstants.ACTION_ERROR,
      arguments: [token, error]
    }));
  }

  function dispatchStarting(args) {
    dispatch(new ActionPayload({
      type: ActionConstants.ACTION_STARTING,
      arguments: [{
        token: token,
        type: expectedActionType,
        arguments: args
      }]
    }));
  }
});