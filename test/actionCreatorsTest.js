var sinon = require('sinon');
var expect = require('chai').expect;
var DataFlowStore = require('./lib/dataFlowStore');
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
      expect(dispatcher.dispatch).to.have.been.calledOnce;
    });
  });

  xdescribe('tracing', function () {
    var Marty = require('../index');
    var dataFlows, actionType, foo, store;

    beforeEach(function () {
      foo = {bar: 'baz'};
      actionType = 'RECEIVE_FOO';
      dataFlows = new DataFlowStore();
      store = Marty.createStore({
        name: 'Foo Store',
        handlers: {
          receiveFoo: actionType
        },
        receiveFoo: function (foo) {
          this.state.concat([foo]);
          this.hasChanged();
        },
        getInitialState: function () {
          return [];
        }
      });
      actionCreators = Marty.createActionCreators({
        name: 'FooActions',
        addFoo: function (foo) {
          this.dispatch(actionType, foo);
        }
      });
    });

    afterEach(function () {
      dataFlows.dispose();
    });

    describe('when I create an action', function () {
      var first;

      beforeEach(function () {
        actionCreators.addFoo(foo);
        first = dataFlows.first;
      });

      it('should trace all function calls', function () {
        console.log(require('util').inspect(first.toJSON(), { depth: null, colors: true }));
        expect(first.toJSON()).to.eql({
          instigator: {
            name: actionCreators.name,
            type: 'ActionCreator',
            action: 'addFoo',
            arguments: [foo]
          },
          payload: {
            actionType: actionType,
            arguments: [foo]
          },
          handlers: [{
            name: store.name,
            type: 'Store',
            action: 'receiveFoo',
            state: {
              before: [],
              after: [foo]
            },
            updateComponents: []
          }]
        });
      });
    });
  });

  describe('#dispatchViewAction()', function () {
    it('should dispatch the action');
    it('should set the view source to being VIEW');
  });

  describe('#dispatchServerAction()', function () {
    it('should dispatch the action');
    it('should set the view source to being SERVER');
  });
});
