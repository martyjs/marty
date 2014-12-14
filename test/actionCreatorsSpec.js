var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var MockDispatcher = require('./lib/mockDispatcher');
var ActionCreators = require('../lib/actionCreators');

describe('ActionCreators', function () {
  var actionCreators, dispatcher;
  var token, expectedActionType, expectedOtherArg, expectedArg;
  var actualAction, payload, expectedError, promise;

  beforeEach(function () {
    dispatcher = new MockDispatcher();
  });

  describe('when you override the action type', function () {
    beforeEach(function () {
      expectedArg = { a: 1 };
      expectedActionType = 'FOO_BAR';
      actionCreators = new ActionCreators({
        dispatcher: dispatcher,
        someAction: [expectedActionType, function (arg) {
          this.dispatch(arg);
        }]
      });

      actionCreators.someAction(expectedArg);
    });

    it('should dispatch the action with the given action type', function () {
      expect(dispatcher.getActionWithType(expectedActionType));
    });
  });

  describe('when the action returns a promise', function () {
    describe('when the promise fails', function () {
      beforeEach(function (done) {
        expectedError = new Error('foo');
        promise = new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(expectedError);
          });
        });

        actionCreators = new ActionCreators({
          dispatcher: dispatcher,
          someAction: function () {
            return promise;
          }
        });

        token = actionCreators.someAction();

        promise.catch(function () {
          actualAction = dispatcher.getActionWithType('ACTION_ERROR');
          payload = (actualAction || { arguments: [] }).arguments[0];
          done();
        });
      });

      it('should dispatch {action type}_FAILED', function () {
        expect(dispatcher.getActionWithType('SOME_ACTION_FAILED')).to.exist;
      });

      it('should dispatch an ACTION_ERROR action', function () {
        expect(actualAction).to.exist;
      });

      it('should include the actions token', function () {
        expect(payload.token).to.equal(token);
      });

      it('should include the error', function () {
        expect(payload.error).to.equal(expectedError);
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

        actionCreators = new ActionCreators({
          dispatcher: dispatcher,
          someAction: function () {
            dispatched = promise.then((function () {
              this.dispatch(expectedArg);
            }).bind(this));

            return dispatched;
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

  describe('when the action throws an error', function () {
    beforeEach(function () {
      expectedError = new Error('foo');
      actionCreators = new ActionCreators({
        dispatcher: dispatcher,
        someAction: function () {
          throw expectedError;
        }
      });
      token = actionCreators.someAction();
      actualAction = dispatcher.getActionWithType('ACTION_ERROR');
      payload = (actualAction || {}).arguments[0];
    });

    it('should dispatch {action type}_FAILED', function () {
      expect(dispatcher.getActionWithType('SOME_ACTION_FAILED')).to.exist;
    });

    it('should dispatch an ACTION_ERROR action', function () {
      expect(actualAction).to.exist;
    });

    it('should include the actions token', function () {
      expect(payload.token).to.equal(token);
    });

    it('should include the error', function () {
      expect(payload.error).to.equal(expectedError);
    });

    it('should NOT dispatch an ACTION_DONE action', function () {
      expect(dispatcher.getActionWithType('ACTION_DONE')).to.not.exist;
    });
  });

  describe('when the action returns an error', function () {
    beforeEach(function () {
      expectedError = new Error('foo');
      actionCreators = new ActionCreators({
        dispatcher: dispatcher,
        someAction: function () {
          return expectedError;
        }
      });
      token = actionCreators.someAction();
      actualAction = dispatcher.getActionWithType('ACTION_ERROR');
      payload = (actualAction || {}).arguments[0];
    });

    it('should dispatch {action type}_FAILED', function () {
      expect(dispatcher.getActionWithType('SOME_ACTION_FAILED')).to.exist;
    });

    it('should dispatch an ACTION_ERROR action', function () {
      expect(actualAction).to.exist;
    });

    it('should include the actions token', function () {
      expect(payload.token).to.equal(token);
    });

    it('should include the error', function () {
      expect(payload.error).to.equal(expectedError);
    });

    it('should NOT dispatch an ACTION_DONE action', function () {
      expect(dispatcher.getActionWithType('ACTION_DONE')).to.not.exist;
    });
  });

  describe('when the action does not return anything', function () {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedActionType = 'SOME_ACTION';
      actionCreators = new ActionCreators({
        dispatcher: dispatcher,
        someAction: function (arg) {
          this.dispatch(expectedOtherArg, arg);
        }
      });
      token = actionCreators.someAction(expectedArg);
    });

    it('should return an action token', function () {
      expect(token).to.be.a('string');
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
        expect(payload.token).to.equal(token);
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
        expect(actualAction.arguments).to.eql([token]);
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

      actionCreators = new ActionCreators({
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
