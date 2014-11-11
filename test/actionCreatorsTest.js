var sinon = require('sinon');
var expect = require('chai').expect;
var ActionCreators = require('../lib/actionCreators');

describe('ActionCreators', function () {
  var actionCreators, dispatcher, testConstant = 'TEST';

  beforeEach(function () {
    dispatcher = {
      dispatch: sinon.spy()
    };

    actionCreators = new ActionCreators({
      trace: false,
      dispatcher: dispatcher,
      initialize: sinon.spy(),
      test: function (message) {
        this.dispatch(testConstant, message);
      }
    });
  });

  it('should call initialize once', function () {
    expect(actionCreators.initialize).to.have.been.calledOnce;
  });

  describe('#mixins', function () {
    it('should allow you to mixin object literals');
  });

  describe('#dispatch()', function () {
    var message = 'Hello World';

    beforeEach(function () {
      actionCreators.test(message);
    });

    it('should call dispatcher#dispatch', function () {
      expect(dispatcher.dispatch).to.have.been.calledOnce;
    });

    it('should pass the action type and data to the dispatcher', function () {
      expect(dispatcher.dispatch).to.have.been.calledWith({
        actionType: testConstant,
        data: message
      });
    });
  });
});
