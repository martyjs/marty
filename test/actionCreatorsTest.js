// var React = require('react');
var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var MockDispatcher = require('./lib/mockDispatcher');
var ActionCreators = require('../lib/actionCreators');
// var TestUtils = require('react/addons').addons.TestUtils;

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

  // describe('#dispatch()', function () {
  //   var message = 'Hello World';

  //   beforeEach(function () {
  //     actionCreators.test(message);
  //   });

  //   it('should call dispatcher#dispatch', function () {
  //     expect(dispatcher.dispatch).to.have.been.calledOnce;
  //   });

  //   it('should pass the action type and data to the dispatcher', function () {
  //     expect(dispatcher.dispatch).to.have.been.calledOnce;
  //   });
  // });

  describe('#getActionType()', function () {
    it('should return the function name as upper case with underscores', function () {
      expect(actionCreators.getActionType('fooBarBaz')).to.equal('FOO_BAR_BAZ');
    });
  });

  // describe('tracing', function () {
  //   var Marty = require('../index');
  //   var actions, actionType, foo, store, fooView, barView;

  //   beforeEach(function () {
  //     foo = {bar: 'baz'};
  //     actionType = 'RECEIVE_FOO';
  //     diagnostics.enabled = true;
  //     actions = new ActionStore();
  //     store = Marty.createStore({
  //       name: 'Foo Store',
  //       handlers: {
  //         receiveFoo: actionType
  //       },
  //       receiveFoo: function (foo) {
  //         this.state.push(foo);
  //         this.hasChanged();
  //       },
  //       getInitialState: function () {
  //         return [];
  //       }
  //     });
  //     actionCreators = Marty.createActionCreators({
  //       name: 'FooActions',
  //       addFoo: function (foo) {
  //         this.dispatchViewAction(actionType, foo);
  //       }
  //     });
  //     fooView = renderClassWithState({
  //       name: 'Foos',
  //       foos: store
  //     });
  //     barView = renderClassWithState({
  //       name: 'Bars',
  //       bars: store
  //     });
  //   });

  //   afterEach(function () {
  //     actions.dispose();
  //     diagnostics.enabled = false;
  //   });

  //   describe('when I dispatch an action', function () {
  //     var first;

  //     beforeEach(function () {
  //       actionCreators.addFoo(foo);
  //       first = actions.first;
  //     });

  //     it('should trace all function calls', function () {
  //       expect(first.toJSON()).to.eql({
  //         type: actionType,
  //         source: 'VIEW',
  //         arguments: [foo],
  //         creator: {
  //           name: actionCreators.name,
  //           type: 'ActionCreator',
  //           action: 'addFoo',
  //           arguments: [foo]
  //         },
  //         handlers: [{
  //           store: store.name,
  //           type: 'Store',
  //           name: 'receiveFoo',
  //           error: null,
  //           state: {
  //             before: [],
  //             after: [foo]
  //           },
  //           views: [{
  //             name: 'Foos',
  //             error: null,
  //             state: {
  //               before: {
  //                 foos: []
  //               },
  //               after: {
  //                 foos: [foo]
  //               }
  //             }
  //           }, {
  //             name: 'Bars',
  //             error: null,
  //             state: {
  //               before: {
  //                 bars: []
  //               },
  //               after: {
  //                 bars: [foo]
  //               }
  //             }
  //           }]
  //         }]
  //       });
  //     });
  //   });
  // });

  // function renderClassWithState(stateProps) {
  //   var state = require('../index').createStateMixin(stateProps);

  //   return TestUtils.renderIntoDocument(React.createElement(React.createClass({
  //     mixins: [state],
  //     render: function () {
  //       return React.createElement('div', null, this.state.name);
  //     }
  //   })));
  // }
});
