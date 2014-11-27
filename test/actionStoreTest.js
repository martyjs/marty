var sinon = require('sinon');
var expect = require('chai').expect;
var Action = require('../lib/action');
var dispatch = require('./lib/dispatch');
var ActionStore = require('../lib/stores/actionsStore');
var ActionConstants = require('../lib/internalConstants').Actions;

describe('ActionStore', function () {
  var listener, expectedActionType, action, actualAction;

  beforeEach(function () {
    listener = sinon.spy();
    expectedActionType = 'FOO_BAR';
    action = new Action(expectedActionType);
  });

  afterEach(function () {
    ActionStore.dispose();
  });

  describe('when an action starts', function () {
    beforeEach(function () {
      ActionStore.addChangeListener(listener);
      dispatch(ActionConstants.ACTION_STARTING, action);
      actualAction = ActionStore.getAction(action.token);
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

    it('should emit a change to all listeners', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });

  describe('when an action fails', function () {
    var expectedError;

    beforeEach(function () {
      expectedError = new Error();
      dispatch(ActionConstants.ACTION_STARTING, action);

      ActionStore.addChangeListener(listener);
      dispatch(ActionConstants.ACTION_ERROR, action.token, expectedError);
      actualAction = ActionStore.getAction(action.token);
    });

    it('should have a \'error\' status', function () {
      expect(actualAction.status).to.equal('error');
    });

    it('should have the error', function () {
      expect(actualAction.error).to.equal(expectedError);
    });

    it('should say the action is done', function () {
      expect(actualAction.done).to.be.true;
    });

    it('should emit a change to all listeners', function () {
      expect(listener).to.have.been.calledOnce;
    });
  });

  describe('when an action is done', function () {
    var expectedError;

    beforeEach(function () {
      expectedError = new Error();
      dispatch(ActionConstants.ACTION_STARTING, action);

      ActionStore.addChangeListener(listener);
      dispatch(ActionConstants.ACTION_DONE, action.token);
      actualAction = ActionStore.getAction(action.token);
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
});