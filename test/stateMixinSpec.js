var React = require('react');
var sinon = require('sinon');
var Marty = require('../index');
var expect = require('chai').expect;
var uuid = require('../lib/utils/uuid');
var Diagnostics = require('../diagnostics');
var ActionPayload = require('../lib/actionPayload');
var StateMixin = require('../lib/mixins/stateMixin');
var TestUtils = require('react/addons').addons.TestUtils;

describe('StateMixin', function () {
  var element, sandbox, mixin, initialState;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    initialState = {
      name: 'hello'
    };

    mixin = new StateMixin({
      getInitialState: function () {
        return initialState;
      }
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should throw an error if you dont pass in an object literal', function () {
    expect(function () { StateMixin(); }).to.throw(Error);
  });

  describe('when a store changes', function () {
    var expectedState, expectedId, action, store, log;

    beforeEach(function () {
      expectedId = '123';
      sandbox.stub(uuid, 'small').returns(expectedId);
      action = new ActionPayload();
      expectedState = {};
      log = console.log;
      console.log = function () {};
      store = {
        displayName: 'foo',
        action: action,
        addChangeListener: sinon.spy(),
        getState: sinon.stub().returns(expectedState),
      };

      mixin = new StateMixin({
        displayName: 'bar',
        listenTo: store,
        getState: function () {
          return store.getState();
        }
      });

      action.addStoreHandler(store, 'test');
      element = renderClassWithMixin(mixin);
    });

    describe('when the handler fails', function () {
      var expectedError;

      beforeEach(function () {
        expectedError = new Error();
        store.getState = sinon.stub().throws(expectedError);
        element.onStoreChanged(null, store);
      });

      it('should add a view to the handler', function () {
        expect(action.handlers[0].views[0]).to.eql({
          name: 'bar',
          id: expectedId,
          error: expectedError,
          state: {
            after: null,
            before: undefined
          }
        });
      });
    });

    describe('when the handler is successful', function () {
      beforeEach(function () {
        element.onStoreChanged(null, store);
      });

      it('should add a view to the handler', function () {
        expect(action.handlers[0].views[0]).to.eql({
          name: 'bar',
          error: null,
          id: expectedId,
          state: {
            after: null,
            before: undefined
          }
        });
      });
    });

    afterEach(function () {
      console.log = log;
    });
  });

  describe('when you pass in a store', function () {
    var newState, store;

    beforeEach(function () {
      newState = { bim: 'bam' };
      initialState = { bim: 'bar' };
      store = createStore(initialState);
      mixin = new StateMixin(store);
      element = renderClassWithMixin(mixin);
    });

    it('should return the stores state in #getInitialState()', function () {
      expect(element.state).to.eql(initialState);
    });

    it('should update the elements state when you update the store', function () {
      store.setState(newState);
      expect(element.state).to.eql(newState);
    });
  });

  describe('when the component unmounts', function () {
    var disposable, store;

    beforeEach(function () {
      disposable = {
        dispose: sinon.spy()
      };

      store = {
        getState: function () {
          return {};
        },
        addChangeListener: function () {
          return disposable;
        }
      };

      mixin = new StateMixin(store);
      element = renderClassWithMixin(mixin);

      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    });

    it('should dispose of any listeners', function () {
      expect(disposable.dispose).to.have.been.called;
    });
  });

  describe('when the component props changes', function () {
    var child, parent, childRenderCount;

    beforeEach(function () {
      childRenderCount = 0;
      mixin = new StateMixin({
        getState: sinon.spy(function () {
          return {};
        })
      });

      child = React.createClass({
        mixin: [mixin],
        render: function () {
          childRenderCount++;
          return React.createElement('div');
        }
      });

      parent = React.createClass({
        render: function () {
          return React.createElement(child, { user: this.state.user });
        },
        getInitialState: function () {
          return {
            user: { name: 'foo' }
          };
        }
      });

      element = TestUtils.renderIntoDocument(React.createElement(parent));

      element.setState({
        user: { name: 'bar' }
      });
    });

    it('should update the components state', function () {
      expect(childRenderCount).to.equal(2);
    });
  });

  describe('when you pass in an object literal', function () {
    describe('#getState()', function () {
      describe('when not listening to anything', function () {
        var context;
        beforeEach(function () {
          mixin = new StateMixin({
            getState: function () {
              context = this;
              return initialState;
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should call #getState() when calling #getInitialState()', function () {
          expect(element.state).to.eql(initialState);
        });

        it('should set the function context to the store', function () {
          expect(context).to.equal(element);
        });
      });
    });

    describe('#getInitialState()', function () {
      var state;
      beforeEach(function () {
        state = {
          foo: 'bar'
        };

        initialState = {
          bar: 'baz'
        };

        mixin = new StateMixin({
          getInitialState: function () {
            return initialState;
          },
          getState: function () {
            return state;
          }
        });
      });
      it('should set state to merge of #getInitialState() and #getState()', function () {
        expect(mixin.getInitialState()).to.eql({
          foo: 'bar',
          bar: 'baz'
        });
      });
    });

    describe('#listenTo', function () {
      var newState = {
        meh: 'bar'
      };

      describe('when you listen to a non-store', function () {
        var listenToObject;
        beforeEach(function () {
          listenToObject = function () {
            return new StateMixin({
              listenTo: [{}, createStore()]
            });
          };
        });

        it('should throw an error', function () {
          expect(listenToObject).to.throw(Error);
        });
      });

      describe('single store', function () {
        var store;
        beforeEach(function () {
          store = createStore();
          mixin = new StateMixin({
            listenTo: store,
            getState: function () {
              return store.getState();
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should called #getState() when the store has changed', function () {
          store.setState(newState);
          expect(element.state).to.eql(newState);
        });

        afterEach(function () {
          store.dispose();
        });
      });

      describe('multiple stores', function () {
        var store1, store2;
        var store1State = { woo: 'bar' };
        var newState = { foo: 'bar' };

        beforeEach(function () {
          store1 = createStore(store1State);
          store2 = createStore();

          mixin = new StateMixin({
            listenTo: [store1, store2],
            getState: function () {
              return {
                store1: store1.getState(),
                store2: store2.getState()
              };
            }
          });
          element = renderClassWithMixin(mixin);
        });

        it('should called #getState() when any of the stores change', function () {
          store2.setState(newState);
          expect(element.state).to.eql({
            store1: store1State,
            store2: newState
          });
        });

        afterEach(function () {
          store1.dispose();
          store2.dispose();
        });
      });
    });
  });

  describe('when you pass in an object literal of stores', function () {
    var store1, store2;
    var store1State = { woo: 'bar' };
    var newState = { foo: 'bar' };

    beforeEach(function () {
      store1 = createStore(store1State);
      store2 = createStore();

      mixin = new StateMixin({
        store1: store1,
        store2: store2
      });

      element = renderClassWithMixin(mixin);
    });

    it('should called #getState() when any of the stores change', function () {
      store2.setState(newState);
      expect(element.state).to.eql({
        store1: store1State,
        store2: newState
      });
    });

    afterEach(function () {
      store1.dispose();
      store2.dispose();
    });
  });

  describe('when you pass in an object literal of stores', function () {
    var manualState = { foo: 'bar' };
    var store, storeState = { bar: 'baz'};

    beforeEach(function () {
      store = createStore(storeState);

      mixin = new StateMixin({
        storeState: store,
        getState: function () {
          return {
            manualState: manualState
          };
        }
      });

      element = renderClassWithMixin(mixin);
    });

    it('should merge store state and #getState()', function () {
      expect(element.state).to.eql({
        storeState: storeState,
        manualState: manualState
      });
    });

    afterEach(function () {
      store.dispose();
    });
  });

  function createStore(state) {
    return Marty.createStore({
      getInitialState: function () {
        return state || {};
      }
    });
  }

  function renderClassWithMixin(mixin, render) {
    return TestUtils.renderIntoDocument(React.createElement(React.createClass({
      mixins: [mixin],
      displayName: mixin.displayName,
      render: render || function () {
        return React.createElement('div', null, this.state.name);
      }
    })));
  }
});