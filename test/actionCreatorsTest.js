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
        arguments: [message]
      });
    });
  });

  describe('tracing', function () {
    var Marty = require('../index');
    var dataFlows;

    beforeEach(function () {
      dataFlows = new DataFlowStore();
      actionCreators = Marty.createActionCreators({
        name: 'TraceCreator',
        concat: function (a, b) {
          console.log('concat', this.id)
          setTimeout((function () {
            console.log('concat.timeout', this.id)
            this.bar(a, b);
          }).bind(this), 10);
        },
        bar: function (a, b) {
          console.log('bar', this.id)
          this.dispatch('test', a, b);
        }
      });
    });

    afterEach(function () {
      dataFlows.dispose();
    });

    describe('when I create an action', function () {
      var first, second;

      beforeEach(function (done) {
        console.log(actionCreators);
        actionCreators.concat('foo', 'bar');
        // actionCreators.bar('bim', 'bam');
        first = dataFlows.first;
        second = dataFlows.second;

        setTimeout(done, 10);
      });

      it.only('should have a data flow for every new call', function () {
        expect(dataFlows.length).to.equal(2);
      });

      it('should trace all function calls', function () {
        console.log(require('util').inspect(first.toJSON(), { depth: null, colors: true }))
        expect(first.toJSON()).to.eql({
          name: 'concat',
          arguments: ['foo', 'bar'],
          context: { type: 'ActionCreator', id: 'TraceCreator' },
          returnValue: null,
          complete: true,
          children: [{
            name: 'dispatch',
            arguments: ['test', 'foo', 'bar'],
            context: { type: 'Dispatcher', id: null },
            returnValue: null,
            complete: true,
            children: []
          }]
        });
      });
    });
  });
});
