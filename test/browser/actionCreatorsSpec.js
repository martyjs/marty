var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var Dispatcher = require('flux').Dispatcher;
var Promise = require('es6-promise').Promise;
var constants = require('../../lib/constants');
var stubbedLogger = require('../lib/stubbedLogger');
var MockDispatcher = require('./lib/mockDispatcher');
var serializeError = require('../../lib/utils/serializeError');
var describeStyles = require('./../lib/describeStyles');

describe('ActionCreators', function () {
  var actionCreators, dispatcher, actualResult, actualError, Marty;
  var expectedActionType, expectedOtherArg, expectedArg;
  var actualAction, payload, expectedError, promise, logger;

  beforeEach(function () {
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
    Marty = require('../../marty').createInstance();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when you create an action creator called \'dispatch\'', function () {
    it('should throw an error', function () {
      expect(createADispatchActionCreator).to.throw(Error);

      function createADispatchActionCreator() {
        var TestConstants = constants(['DISPATCH']);

        return Marty.createActionCreators({
          dispatcher: dispatcher,
          dispatch: TestConstants.DISPATCH()
        });
      }
    });
  });

  describe('resolve', function () {
    var context, creators, actualInstance, expectedInstance, action;

    beforeEach(function () {
      action = sinon.spy();
      creators = Marty.createActionCreators({
        id: 'foo',
        displayName: 'Bar',
        someAction: action
      });

      context = Marty.createContext();
      actualInstance = creators.for(context);
      expectedInstance = context.instances.ActionCreators.foo;
    });

    it('should resolve to the actual instance', function () {
      expect(actualInstance).to.equal(expectedInstance);
    });

    it('should still expose all actions', function () {
      creators.someAction(1);
      expect(action).to.be.calledWith(1);
    });
  });

  describe('when the action creator is created from a constant', function () {
    describe('when you pass in a function', function () {
      var TestConstants, expectedProperties;
      beforeEach(function () {
        expectedProperties = {
          foo: 'bar',
          baz: 'bam'
        };

        TestConstants = constants(['TEST_CONSTANT']);

        actionCreators = Marty.createActionCreators({
          dispatcher: dispatcher,
          testConstant: TestConstants.TEST_CONSTANT(function (a, b, c) {
            this.dispatch(a, b, c);
          })
        });
      });

      describe('when I create an action', function () {
        var expectedArguments;

        beforeEach(function () {
          expectedArguments = [1, 2, 3];
          actionCreators.testConstant.apply(actionCreators, expectedArguments);
          actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
        });

        it('should dispatch an action with the constant name', function () {
          expect(actualAction).to.exist;
        });

        it('should pass through all the arguments', function () {
          expect(actualAction.arguments).to.eql(expectedArguments);
        });
      });
    });

    describe('when you dont pass in a function', function () {
      var TestConstants, expectedProperties;
      beforeEach(function () {
        expectedProperties = {
          foo: 'bar',
          baz: 'bam'
        };

        TestConstants = constants(['TEST_CONSTANT']);

        actionCreators = Marty.createActionCreators({
          dispatcher: dispatcher,
          testConstant: TestConstants.TEST_CONSTANT()
        });
      });

      describe('when I create an action', function () {
        var expectedArguments;

        beforeEach(function () {
          expectedArguments = [1, 2, 3];
          actionCreators.testConstant.apply(actionCreators, expectedArguments);
          actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
        });

        it('should dispatch an action with the constant name', function () {
          expect(actualAction).to.exist;
        });

        it('should pass through all the arguments', function () {
          expect(actualAction.arguments).to.eql(expectedArguments);
        });
      });
    });
  });

  describeStyles('when the action does not return anything', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedActionType = 'SOME_ACTION';
      actionCreators = styles({
        classic: function () {
          return Marty.createActionCreators({
            dispatcher: dispatcher,
            someAction: function (arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          });
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            someAction(arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          }

          return new TestActionCreators({
            dispatcher: dispatcher
          });
        }
      });

      actualResult = actionCreators.someAction(expectedArg);
    });

    it('should not return anything', function () {
      expect(actualResult).to.not.be.defined;
    });

    describe('#dispatch()', function () {
      beforeEach(function () {
        actualAction = dispatcher.getActionWithType(expectedActionType);
      });

      it('should dispatch the action with the given action type', function () {
        expect(actualAction).to.exist;
      });

      it('should dispatch the action with the given arguments', function () {
        expect(actualAction.arguments).to.eql([expectedOtherArg, expectedArg]);
      });
    });
  });

  describe('#mixins', function () {
    var mixin1, mixin2;

    beforeEach(function () {
      mixin1 = {
        foo: function () { return 'bar'; }
      };

      mixin2 = {
        bar: function () { return 'baz'; }
      };

      actionCreators = Marty.createActionCreators({
        dispatcher: dispatcher,
        mixins: [mixin1, mixin2]
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(actionCreators.foo()).to.equal('bar');
      expect(actionCreators.bar()).to.equal('baz');
    });
  });
});
