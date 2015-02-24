var sinon = require('sinon');
var React = require('react');
var Marty = require('../../index');
var expect = require('chai').expect;
var TestUtils = require('react/addons').addons.TestUtils;

describe('Component', function () {
  var Store, Component, getState, expectedId;

  describe('when you listen to stores', function () {
    beforeEach(function () {
      expectedId = 123;
      getState = sinon.spy();

      Store = Marty.register(FooStore);
      Component = render(FooComponent);
    });

    it('should call `getState` when the component mounts', function () {
      expect(Component.state).to.eql({
        foo: null
      });
    });

    describe('when the store changes', function () {
      var expectedState;
      beforeEach(function () {
        expectedState = { bar: 'baz' };
        Store.replaceState({
          [expectedId]: expectedState
        });
      });

      it('should update the state with the result of `getState`', function () {
        expect(Component.state).to.eql({
          foo: expectedState
        });
      });
    });
  });

  describe('when you dont implement `getState`', function () {
    it('should default to returning {}');
  });

  describe('when you listen to an array of stores', function () {
    it('should listen to all of the stores');
  });

  describe('when the component unmounts', function () {
    it('should stop listening to any stores');
  });

  describe('when you implement `getInitialState`', function () {
    it('should merge `getInitialState` with `getState`');
  });

  function render(component) {
    return TestUtils.renderIntoDocument(React.createElement(component));
  }

  class FooStore extends Marty.Store {
    getFoo(id) {
      return this.state[id] || null;
    }
  }

  class FooComponent extends Marty.Component {
    constructor(props) {
      super(props);
      this.listenTo = Store;
    }

    render() {
      return <div>foo</div>;
    }

    getState() {
      return {
        foo: Store.getFoo(expectedId)
      };
    }
  }
});