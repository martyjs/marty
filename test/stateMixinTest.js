var React = require('react');
var Marty = require('../index');
var expect = require('chai').expect;
var StateMixin = require('../lib/stateMixin');
var TestUtils = require('react/addons').addons.TestUtils;

describe('StateMixin', function () {
  var element, mixin, initialState;

  beforeEach(function () {
    initialState = {
      name: 'hello'
    };

    mixin = new StateMixin({
      getInitialState: function () {
        return initialState;
      }
    });
  });

  it('should throw an error if you dont pass in an object literal', function () {
    expect(function () { StateMixin(); }).to.throw(Error);
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
    it('should dispose of any listeners');
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
      render: render || function () {
        return React.createElement('div', null, this.state.name);
      }
    })));
  }
});