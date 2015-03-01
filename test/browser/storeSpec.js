var sinon = require('sinon');
var _ = require('lodash-node');
var Marty = require('../../browser');
var expect = require('chai').expect;
var Dispatcher = require('../../dispatcher');
var stubbedLogger = require('../lib/stubbedLogger');
var ActionPayload = require('../../lib/actionPayload');
var describeStyles = require('./../lib/describeStyles');
var ActionHandlerNotFoundError = require('../../errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('../../errors/actionPredicateUndefined');

describeStyles('Store', function (styles, currentStyle) {
  var store, changeListener, listener, dispatcher, dispatchToken = 'foo', initialState = {};
  var actualAction, actualChangeListenerFunctionContext, expectedChangeListenerFunctionContext;
  var expectedError, logger;

  beforeEach(function () {
    logger = stubbedLogger();
    dispatcher = {
      register: sinon.stub().returns(dispatchToken),
      unregister: sinon.spy()
    };

    expectedError = new Error('foo');

    var handlers = {
      error: 'ERROR',
      one: 'one-action',
      multiple: ['multi-1-action', 'multi-2-action'],
      where: { source: 'VIEW' },
      whereAndAction: [{source: 'VIEW'}, 'where-and-action']
    };

    var proto = {
      where: sinon.spy(),
      multiple: sinon.spy(),
      initialize: sinon.spy(),
      whereAndAction: sinon.spy(),
      error: sinon.stub().throws(expectedError),
      getInitialState: sinon.stub().returns(initialState),
      one: sinon.spy(function () {
        actualAction = this.action;
      })
    };

    store = styles({
      classic: function () {
        return Marty.createStore(_.extend({
          id: 'test',
          handlers: handlers,
          dispatcher: dispatcher,
          displayName: 'TestStore'
        }, proto));
      },
      es6: function () {
        class TestStore extends Marty.Store {
          constructor(options) {
            super(options);
            this.handlers = handlers;
            this.state = initialState;
            this.displayName = 'TestStore';
          }
        }

        _.extend(TestStore.prototype, _.omit(proto, 'getInitialState'));

        return new TestStore({
          dispatcher: dispatcher
        });
      }
    });

    expectedChangeListenerFunctionContext = {};
    listener = sinon.spy(function () {
      actualChangeListenerFunctionContext = this;
    });
    changeListener = store.addChangeListener(listener, expectedChangeListenerFunctionContext);
  });

  afterEach(function () {
    logger.restore();
  });

  it('should have a dispatch token', function () {
    expect(store.dispatchToken).to.equal(dispatchToken);
  });

  it('should have registered handleAction with the dispatcher', function () {
    expect(dispatcher.register).to.have.been.called;
  });

  if (currentStyle === 'classic') {

    describe('#mixins', function () {
      describe('when you have multiple mixins', function () {
        var mixin1, mixin2;

        beforeEach(function () {
          mixin1 = {
            foo: function () { return 'bar'; }
          };

          mixin2 = {
            bar: function () { return 'baz'; }
          };

          store = Marty.createStore({
            id: 'multiple-mixins',
            dispatcher: dispatcher,
            getInitialState: _.noop,
            mixins: [mixin1, mixin2]
          });
        });

        it('should allow you to mixin object literals', function () {
          expect(store.foo()).to.equal('bar');
          expect(store.bar()).to.equal('baz');
        });
      });

      describe('when the mixin has handlers', function () {
        var handlerMixin;

        beforeEach(function () {
          handlerMixin = {
            handlers: {
              baz: 'BAZ'
            },
            baz: _.noop
          };

          store = Marty.createStore({
            id: 'mixin-with-handlers',
            dispatcher: dispatcher,
            handlers: {
              foo: 'FOO',
              bar: 'BAR'
            },
            getInitialState: _.noop,
            mixins: [handlerMixin],
            foo: _.noop,
            bar: _.noop
          });
        });

        it('should do a deep merge', function () {
          expect(store.handlers).to.include.keys('foo', 'bar', 'baz');
        });
      });
    });

    describe('#getInitialState()', function () {
      it('should be called once', function () {
        expect(store.getInitialState).to.have.been.calledOnce;
      });

      it('should set the stores state to the initial state', function () {
        expect(store.state).to.equal(initialState);
      });
    });
  }

  describe('#state', function () {
    var newState;
    beforeEach(function () {
      newState = {};
      store.state = newState;
    });

    it('should update the state', function () {
      expect(store.state).to.equal(newState);
    });

    it('should call the change listener with the new state', function () {
      expect(listener).to.have.been.calledWith(newState);
    });
  });

  describe('#replaceState()', function () {
    describe('when the state has changed', function () {
      var newState;
      beforeEach(function () {
        newState = {};
        store.replaceState(newState);
      });

      it('should update the state', function () {
        expect(store.state).to.equal(newState);
      });

      it('should call the change listener with the new state', function () {
        expect(listener).to.have.been.calledWith(newState);
      });
    });

    describe('when the state has not changed', function () {
      beforeEach(function () {
        store.replaceState(store.state);
      });

      it('should not call the change linstener', function () {
        expect(listener).to.not.have.been.called;
      });
    });
  });

  describe('#setState()', function () {
    var initialState, newState;

    beforeEach(function () {
      initialState = { foo: 'bar' };
      store.replaceState(initialState);
    });

    describe('when the passed in value is an object', function () {
      beforeEach(function () {
        newState = {
          bam: 1
        };

        store.setState(_.clone(newState));
      });

      it('should merge in the state', function () {
        expect(store.state).to.eql(_.extend({}, initialState, newState));
      });
    });
  });

  describe('#addChangeListener()', function () {

    beforeEach(function () {
      store.hasChanged();
    });

    it('should call the change listener', function () {
      expect(listener).to.have.been.calledOnce;
    });

    it('should pass the state and store as the arguments', function () {
      expect(listener).to.have.been.calledWith(store.state, store);
    });

    it('should set the callbacks function context', function () {
      expect(actualChangeListenerFunctionContext).to.equal(expectedChangeListenerFunctionContext);
    });

    describe('#dispose()', function () {
      beforeEach(function () {
        changeListener.dispose();
        store.hasChanged();
      });

      it('should NOT call the change listener', function () {
        expect(listener).to.have.been.calledOnce;
      });
    });
  });

  describe('#dispose()', function () {
    var clear;

    beforeEach(function () {
      clear = sinon.spy();
    });

    describe('when you dont pass in a dispose function', function () {
      beforeEach(function () {
        store = styles({
          classic: function () {
            return Marty.createStore({
              id: 'no dispose',
              dispatcher: dispatcher,
              clear: clear,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class TestStore extends Marty.Store {
            }

            TestStore.prototype.clear = clear;

            return new TestStore({
              dispatcher: dispatcher
            });
          }
        });

        store.addChangeListener(listener);
        store.hasChanged();
        store.dispose();
        store.hasChanged();
      });

      it('should call clear', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });

      it('should make store.dispatchToken undefined', function () {
        expect(store.dispatchToken).to.be.undefined;
      });
    });

    describe('when you pass in a dispose function', function () {
      var dispose;

      beforeEach(function () {
        dispose = sinon.spy();
        store = styles({
          classic: function () {
            return Marty.createStore({
              id: 'dispose',
              dispatcher: dispatcher,
              clear: clear,
              dispose: dispose,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class TestStore extends Marty.Store {
              constructor(options) {
                super(options);
                this.state = {};
              }
              clear() {
                super.clear();
                clear();
              }
              dispose() {
                super.dispose();
                dispose();
              }
            }

            return new TestStore({
              dispatcher: dispatcher
            });
          }
        });

        store.addChangeListener(listener);
        store.hasChanged();
        store.dispose();
        store.hasChanged();
      });

      it('should call the dispose function', function () {
        expect(dispose).to.have.been.calledOnce;
      });

      it('should call clear', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should dispose of all listeners', function () {
        expect(listener).to.have.been.calledOnce;
      });

      it('should call unregister with dispatchToken', function () {
        expect(dispatcher.unregister).to.have.been.calledWith(dispatchToken);
      });

      it('should make store.dispatchToken undefined', function () {
        expect(store.dispatchToken).to.be.undefined;
      });
    });
  });

  describe('#createStore()', function () {
    var data = {}, one;
    var actionType = 'foo';

    beforeEach(function () {
      one = sinon.spy();
      store = styles({
        classic: function () {
          return Marty.createStore({
            id: 'createStore',
            handlers: {
              one: actionType,
            },
            one: one,
            getInitialState: function () {
              return {};
            }
          });
        },
        es6: function () {
          class TestStore extends Marty.Store {
            constructor(options) {
              super(options);
              this.state = {};
              this.handlers = {
                one: actionType
              };
            }
          }

          TestStore.prototype.one = one;

          return new TestStore({
            dispatcher: Dispatcher.getDefault()
          });
        }
      });

      Dispatcher.getDefault().dispatch(new ActionPayload({
        type: actionType,
        arguments: [data]
      }));
    });

    it('calls the handlers', function () {
      expect(one).to.have.been.calledWith(data);
    });
  });

  describe('#handlers', function () {
    describe('when the action handler is null', function () {
      it('should throw an ActionHandlerNotFoundError', function () {
        expect(createStoreWithMissingActionHandler).to.throw(ActionHandlerNotFoundError);

        function createStoreWithMissingActionHandler() {
          var Store = styles({
            classic: function () {
              return Marty.createStore({
                id: 'createStoreWithMissingActionHandler',
                dispatcher: dispatcher,
                handlers: {
                  foo: 'FOO'
                }
              });
            },
            es6: function () {
              class TestStore extends Marty.Store {
                constructor(options) {
                  super(options);
                  this.state = {};
                  this.handlers = {
                    foo: 'FOO'
                  };
                }
              }

              return new TestStore({
                options: dispatcher
              });
            }
          });

          Store.handleAction();
        }
      });
    });

    describe('when the handler action predicate is null', function () {
      it('should throw an ActionPredicateUndefinedError', function () {
        expect(createStoreWithANullActionPredicate).to.throw(ActionPredicateUndefinedError);

        function createStoreWithANullActionPredicate() {
          var Store = styles({
            classic: function () {
              return Marty.createStore({
                id: 'createStoreWithANullActionPredicate',
                dispatcher: dispatcher,
                handlers: {
                  foo: null
                },
                foo: _.noop
              });
            },
            es6: function () {
              class TestStore extends Marty.Store {
                constructor(options) {
                  super(options);
                  this.state = {};
                  this.handlers = {
                    foo: null
                  };
                }
              }

              return new TestStore({
                options: dispatcher
              });
            }
          });

          Store.handleAction();
        }
      });
    });
  });

  describe('#waitFor()', function () {
    var store1, store2, store3, testActionCreators, actualResult, expectedResult, executionOrder;

    beforeEach(function () {
      executionOrder = [];
      expectedResult = 6;
    });

    describe('when I pass in an array of stores', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor([store3, store2]);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in stores as arguments', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(store3, store2);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });

    describe('when I pass in dispatch tokens', function () {
      beforeEach(function () {
        executionOrder = waitFor(function (store) {
          store.waitFor(store3.dispatchToken, store2.dispatchToken);
        });
      });

      it('should wait for the specified stores to complete', function () {
        expect(actualResult).to.equal(expectedResult);
      });

      it('should execute the stores in the specified order', function () {
        expect(executionOrder).to.eql(['store3', 'store2', 'store1']);
      });
    });


    function waitFor(waitForCb) {
      var order = [];

      styles({
        classic: function () {
          testActionCreators = Marty.createActionCreators({
            id: 'test',
            sum: function () {
              this.dispatch(2);
            }
          });

          store2 = Marty.createStore({
            id: 'store2',
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              this.waitFor(store3);
              this.state += store3.getState() + value;
              order.push('store2');
            }
          });

          store1 = Marty.createStore({
            id: 'store1',
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              waitForCb(this);
              this.state = store2.getState() + value;
              order.push('store1');
            }
          });

          store3 = Marty.createStore({
            id: 'store3',
            handlers: { sum: 'SUM'},
            getInitialState: function () {
              return 0;
            },
            sum: function (value) {
              this.state += value;
              order.push('store3');
            }
          });
        },
        es6: function () {
          class TestActionCreators extends Marty.ActionCreators {
            sum() {
              this.dispatch(2);
            }
          }

          class Store1 extends Marty.Store{

            constructor() {
              super();
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              waitForCb(this);
              this.state = store2.getState() + value;
              order.push('store1');
            }
          }

          class Store2 extends Marty.Store {
            constructor() {
              super();
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              this.waitFor(store3);
              this.state += store3.getState() + value;
              order.push('store2');
            }
          }

          class Store3 extends Marty.Store {
            constructor() {
              super();
              this.state = 0;
              this.handlers = { sum: 'SUM'};
            }
            sum(value) {
              this.state += value;
              order.push('store3');
            }
          }

          Store1.id = 'store1';
          Store2.id = 'store2';
          Store3.id = 'store3';

          store2 = new Store2();
          store1 = new Store1();
          store3 = new Store3();

          testActionCreators = new TestActionCreators();
        }
      });

      testActionCreators.sum();
      actualResult = store1.getState();

      return order;
    }
  });

  describe('#handleAction()', function () {
    var data = {}, expectedAction;

    describe('when an error occurs', function () {
      beforeEach(function () {
        expectedAction = new ActionPayload({ type: 'ERROR' });
        try {
          store.handleAction(expectedAction);
        } catch (e) { }
      });

      it('should log the error and any additional metadata', function () {
        var expectedMessage = 'An error occured while trying to handle an ' +
        '\'ERROR\' action in the action handler `error` within the store TestStore';

        expect(logger.error).to.be.calledWith(expectedMessage, expectedError, expectedAction);
      });
    });

    describe('when the store does not handle action type', function () {
      beforeEach(function () {
        handleAction('foo');
      });

      it('should not call any handlers', function () {
        expect(store.one).to.not.have.been.called;
        expect(store.multiple).to.not.have.been.called;
      });
    });

    describe('when the store has one action type for a handler', function () {
      beforeEach(function () {
        expectedAction = handleAction('one-action');
      });

      it('should call the action handler', function () {
        expect(store.one).to.have.been.calledOnce;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.one).to.have.been.calledWith(data);
      });

      it('should make the action accessible in the function context', function () {
        expect(actualAction).to.equal(expectedAction);
      });
    });

    describe('when the store has multiple action types for a handler', function () {
      beforeEach(function () {
        handleAction('multi-1-action');
        handleAction('multi-2-action');
      });

      it('should call the action handler', function () {
        expect(store.multiple).to.have.been.calledTwice;
      });

      it('should pass the payload data to the handler', function () {
        expect(store.multiple).to.have.been.calledWith(data);
      });
    });

    describe('when the store has a where clause for a handler', function () {
      beforeEach(function () {
        handleActionFrom('foo', 'VIEW');
      });

      it('should call the action handler', function () {
        expect(store.where).to.have.been.called;
      });
    });

    describe('when the store has a where clause and an action type for a handler', function () {
      beforeEach(function () {
        handleActionFrom('foo', 'VIEW');
        handleAction('where-and-action');
      });

      it('should call the action handler for either', function () {
        expect(store.whereAndAction).to.have.been.calledTwice;
      });
    });

    describe('rollbacks', function () {
      var Store, ActionCreators, interimState;

      beforeEach(function () {
        Store = styles({
          classic: function () {
            ActionCreators = Marty.createActionCreators({
              id: 'rollbacks',
              add: function (user) {
                var action = this.dispatch(user);

                interimState = _.clone(Store.getState());

                action.rollback();
              }
            });

            return Marty.createStore({
              id: 'store',
              handlers: {
                add: 'ADD'
              },
              getInitialState: function () {
                return [];
              },
              add: function (user) {
                this.state.push(user);

                return function rollback() {
                  this.state.splice(this.state.indexOf(user), 1);
                };
              }
            });
          },
          es6: function () {
            class TestActionCreators extends Marty.ActionCreators {
              add(user) {
                var action = this.dispatch(user);

                interimState = _.clone(Store.getState());

                action.rollback();
              }
            }

            ActionCreators = new TestActionCreators();

            class TestStore extends Marty.Store {
              constructor(options) {
                super(options);
                this.state = [];
                this.handlers = {
                  add: 'ADD'
                };
              }
              add(user) {
                this.state.push(user);

                return function rollback() {
                  this.state.splice(this.state.indexOf(user), 1);
                };
              }
            }

            return new TestStore();
          }
        });
      });

      describe('when you create an action and then rollback', function () {
        var user = {name: 'foo'};

        beforeEach(function () {
          ActionCreators.add(user);
        });

        it('should call the action handler', function () {
          expect(interimState).to.eql([user]);
        });

        it('should call the action handlers rollback functions', function () {
          expect(Store.getState()).to.eql([]);
        });
      });
    });

    function handleAction(actionType) {
      var action = new ActionPayload({
        type: actionType,
        arguments: [data]
      });

      store.handleAction(action);

      return action;
    }

    function handleActionFrom(actionType, source) {
      var action = new ActionPayload({
        source: source,
        type: actionType,
        arguments: [data]
      });

      store.handleAction(action);

      return action;
    }
  });

  describe('#clear()', function () {
    describe('when you do not pass in a clear function', function () {
      beforeEach(function () {
        store = styles({
          classic: function () {
            return Marty.createStore({
              id: 'clear',
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class ClearStore extends Marty.Store {
              constructor() {
                super();
                this.state = {};
              }
            }

            return new ClearStore();
          }
        });

        store.setState({
          foo: 'bar'
        });

        store.clear();
      });

      it('should replace the state with the original state', function () {
        expect(store.state).to.eql({});
      });

      it('should clear the fetchHistory', function () {
        var fetchId = 'foo';
        store.fetch(fetchId, function () { return {}; });

        expect(store.hasAlreadyFetched(fetchId)).to.be.true;

        store.clear();

        expect(store.hasAlreadyFetched(fetchId)).to.be.false;
      });
    });

    describe('when you pass in a clear function', function () {
      var clear;

      beforeEach(function () {
        clear = sinon.spy();
        store = styles({
          classic: function () {
            return Marty.createStore({
              id: 'clear',
              clear: clear,
              getInitialState: function () {
                return {};
              }
            });
          },
          es6: function () {
            class ClearStore extends Marty.Store {
              constructor(options) {
                super(options);
                this.state = {};
              }
              clear() {
                clear();
                super.clear();
              }
            }

            return new ClearStore();
          }
        });

        store.setState({ foo: 'bar'});
        store.clear();
      });

      it('should call the clear function', function () {
        expect(clear).to.have.been.calledOnce;
      });

      it('should replace the state with the original state', function () {
        expect(store.state).to.eql({});
      });
    });
  });
});
