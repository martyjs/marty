var sinon = require('sinon');
var expect = require('chai').expect;
var DataFlowStore = require('./lib/dataFlowStore');
var DataFlow = require('../lib/diagnostics/dataFlow');
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

  describe('tracing', function () {
    var dataFlows;

    beforeEach(function () {
      dataFlows = new DataFlowStore();
      actionCreators = new ActionCreators({
        name: 'foo',
        concat: function (a, b) {
          return a + b;
        }
      });
    });

    describe('when I create an action', function () {
      var result, dataFlow, callId;

      beforeEach(function () {
        callId = 'foo';
        sinon.stub(DataFlow, 'callId').returns(callId);
        result = actionCreators.concat('foo', 'bar');
        dataFlow = dataFlows.getAll()[0];
      });

      it('should start a data flow', function () {
        expect(dataFlow).to.be.defined;
      });

      it('should trace entering the action creator', function () {
        expect(dataFlow.stacktrace[1]).to.eql({
          id: callId,
          source: {
            type: 'ActionCreator',
            id: actionCreators.name
          },
          type: 'entered',
          function: 'concat',
          arguments: ['foo', 'bar']
        });
      });

      it('should trace leaving the action creator', function () {
        expect(dataFlow.stacktrace[2]).to.eql({
          id: callId,
          type: 'left',
          returnValue: 'foobar'
        });
      });

      afterEach(function () {
        DataFlow.callId.restore();
      });
    });
  });
});
