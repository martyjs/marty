var sinon = require('sinon');
var _ = require('underscore');
var expect = require('chai').expect;
var Dispatcher = require('flux').Dispatcher;
var Promise = require('es6-promise').Promise;
var constants = require('../../lib/constants');
var stubbedLogger = require('../lib/stubbedLogger');
var MockDispatcher = require('./lib/mockDispatcher');
var serializeError = require('../../lib/utils/serializeError');
var describeStyles = require('./lib/describeStyles');

describe('ActionCreators', function () {
  var actionCreators, dispatcher, actualResult, actualError, Marty;
  var expectedActionType, expectedOtherArg, expectedArg;
  var actualAction, payload, expectedError, promise, logger;

  beforeEach(function () {
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
    Marty = require('../../index').createInstance();
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
        }, expectedProperties)
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

      it('should pass all properties through', function () {
        var actualProperties = _.pick(actualAction, Object.keys(expectedProperties));
        expect(actualProperties).to.eql(expectedProperties);
      });
    });
  });

  describeStyles('when the action returns a promise', function (styles) {
    describe('when the promise fails', function () {
      beforeEach(function (done) {
        expectedError = new Error('foo');
        promise = new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(expectedError);
          });
        });

        actionCreators = styles({
          classic: function () {
            return Marty.createActionCreators({
              dispatcher: dispatcher,
              someAction: function () {
                return promise;
              }
            });
          },
          es6: function () {
            class TestActionCreators extends Marty.ActionCreators {
              constructor(options) {
                super(options);
              }

              someAction() {
                return promise;
              }
            }

            return new TestActionCreators({
              dispatcher: dispatcher
            });
          }
        });

        actualResult = actionCreators.someAction();

        promise.catch(function () {
          actualAction = dispatcher.getActionWithType('ACTION_FAILED');
          payload = (actualAction || { arguments: [] }).arguments[0];
          done();
        });
      });

      it('should dispatch {action type}_FAILED', function () {
        expect(dispatcher.getActionWithType('SOME_ACTION_FAILED')).to.exist;
      });

      it('should dispatch an ACTION_FAILED action', function () {
        expect(actualAction).to.exist;
      });

      it('should return the promise', function () {
        expect(actualResult).to.equal(promise);
      });

      it('should include the error', function () {
        expect(payload.error).to.eql(serializeError(expectedError));
      });

      it('should NOT dispatch an ACTION_DONE action', function () {
        expect(dispatcher.getActionWithType('ACTION_DONE')).to.not.exist;
      });
    });

    describe('when the promise completes', function () {
      var dispatched;

      beforeEach(function (done) {
        expectedArg = { foo: 'bar' };
        expectedActionType = 'SOME_ACTION';
        promise = new Promise(function (resolve) {
          setTimeout(function () {
            resolve();
          }, 2);
        });

        actionCreators = styles({
          classic: function () {
            return Marty.createActionCreators({
              dispatcher: dispatcher,
              someAction: function () {
                dispatched = promise.then((function () {
                  this.dispatch(expectedArg);
                }).bind(this));

                return dispatched;
              }
            });
          },
          es6: function () {
            class TestActionCreators extends Marty.ActionCreators {
              someAction() {
                dispatched = promise.then((function () {
                  this.dispatch(expectedArg);
                }).bind(this));

                return dispatched;
              }
            }

            return new TestActionCreators({
              dispatcher: dispatcher
            });
          }
        });

        actionCreators.someAction(expectedArg);
        dispatched.then(done);
      });

      it('should dispatch an ACTION_DONE action', function () {
        expect(dispatcher.getActionWithType('ACTION_DONE')).to.exist;
      });

      it('should have dispatched the action', function () {
        expect(dispatcher.getActionWithType(expectedActionType)).to.be.defined;
      });
    });
  });

  describeStyles('when the action throws an error', function (styles) {
    beforeEach(function () {
      expectedError = new Error('foo');
      actionCreators = styles({
        classic: function () {
          return Marty.createActionCreators({
            displayName: 'Test',
            dispatcher: dispatcher,
            someAction: function () {
              throw expectedError;
            }
          });
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            constructor(options) {
              super(options);
              this.displayName = 'Test';
            }

            someAction() {
              throw expectedError;
            }
          }

          return new TestActionCreators({
            dispatcher: dispatcher
          });
        }
      });

      try {
        actionCreators.someAction();
      } catch (e) {
        actualError = e;
      }

      actualAction = dispatcher.getActionWithType('ACTION_FAILED');
      payload = (actualAction || { arguments: [] }).arguments[0];
    });

    it('should log the error', function () {
      var expectedErrorMessage = 'An error occured when dispatching a \'SOME_ACTION\' action in Test#someAction';

      expect(logger.error).to.be.calledWith(expectedErrorMessage, expectedError);
    });

    it('should dispatch {action type}_FAILED', function () {
      expect(dispatcher.getActionWithType('SOME_ACTION_FAILED')).to.exist;
    });

    it('should dispatch an ACTION_FAILED action', function () {
      expect(actualAction).to.exist;
    });

    it('should throw the error', function () {
      expect(actualError).to.equal(expectedError);
    });

    it('should include the error', function () {
      expect(payload.error).to.eql(serializeError(expectedError));
    });

    it('should NOT dispatch an ACTION_DONE action', function () {
      expect(dispatcher.getActionWithType('ACTION_DONE')).to.not.exist;
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
              this.dispatch(expectedOtherArg, arg);
            }
          });
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            someAction(arg) {
              this.dispatch(expectedOtherArg, arg);
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

    describe('when the action is about to start', function () {
      beforeEach(function () {
        actualAction = dispatcher.getActionWithType('ACTION_STARTING');
        payload = (actualAction || {}).arguments[0];
      });

      it('should dispatch an {action type}_STARTING action', function () {
        expect(dispatcher.getActionWithType('SOME_ACTION_STARTING')).to.exist;
      });

      it('should dispatch an ACTION_STARTING action', function () {
        expect(actualAction).to.exist;
      });

      it('should include the actions token', function () {
        expect(payload.token).to.be.defined;
      });

      it('should include the actions type', function () {
        expect(payload.type).to.equal(expectedActionType);
      });
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

    describe('when the action is done', function () {
      beforeEach(function () {
        actualAction = dispatcher.getActionWithType('ACTION_DONE');
      });

      it('should dispatch an ACTION_DONE action', function () {
        expect(actualAction).to.exist;
      });

      it('should include the actions token', function () {
        expect(actualAction.arguments[0]).to.be.defined;
      });
    });
  });

  describe('when the action fails', function () {
    var rollback;

    beforeEach(function () {
      rollback = sinon.stub();

      var dispatcher = new Dispatcher();
      var TestConstants = constants(['TEST']);
      var store = Marty.createStore({ // jshint ignore:line
        id: 'action-fails',
        dispatcher: dispatcher,
        handlers: {
          test: TestConstants.TEST
        },
        getInitialState: function () {
          return {};
        },
        test: function () {
          return rollback;
        }
      });

      var actions = Marty.createActionCreators({
        dispatcher: dispatcher,
        test: TestConstants.TEST(function () {
          this.dispatch();

          throw new Error();
        })
      });
      try {
        actions.test();
      } catch (e) { }
    });

    it('should rollback the action', function () {
      expect(rollback).to.have.been.calledOnce;
    });
  });

  describeStyles('#types', function (styles) {
    var Creators, Constants, fooAction, barAction, expectedArg;

    beforeEach(function () {
      expectedArg = 'foo';
      Constants = constants(['FOO', 'BAR']);
      Creators = styles({
        classic: function () {
          return Marty.createActionCreators({
            id: 'TypeActionCreators',
            dispatcher: dispatcher,
            types: {
              woop: Constants.FOO,
              loop: Constants.BAR
            },
            woop: function (arg) {
              this.dispatch(arg, 2);
            }
          });
        },
        es6: function () {
          class TypeActionCreators extends Marty.ActionCreators {
            constructor(options) {
              super(options);
              this.types = {
                woop: Constants.FOO,
                loop: Constants.BAR
              };
            }
            woop(arg) {
              this.dispatch(arg, 2);
            }
          }

          return new TypeActionCreators({
            dispatcher: dispatcher
          });
        }
      });

      Creators.woop(expectedArg);
      Creators.loop(expectedArg);
      fooAction = dispatcher.getActionWithType('FOO');
      barAction = dispatcher.getActionWithType('BAR');
    });

    it('should annotate the function with the specified type', function () {
      expect(fooAction).to.exist;
      expect(fooAction.arguments).to.eql([expectedArg, 2]);
    });

    it('should create a function that automatically dispatches if there is no function', function () {
      expect(barAction).to.exist;
      expect(barAction.arguments).to.eql([expectedArg]);
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

  describe('#getActionType()', function () {
    it('should return the function name as upper case with underscores', function () {
      expect(actionCreators.getActionType('fooBarBaz')).to.equal('FOO_BAR_BAZ');
    });
  });
});
