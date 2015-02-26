var sinon = require('sinon');
var React = require('react');
var Marty = require('../../index');
var expect = require('chai').expect;
var TestUtils = require('react/addons').addons.TestUtils;

describe('Component', function () {
  var Store, Component, getState, expectedId;

  beforeEach(function () {
    expectedId = 123;
    getState = sinon.spy();
    Store = Marty.register(FooStore);
  });

  describe('when you listen to stores', function () {
    beforeEach(function () {
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
    beforeEach(function () {
      delete FooComponent.prototype.getState;
      Component = render(FooComponent);
      Store.replaceState({
        [expectedId]: { foo: 'bar' }
      });
    });

    it('should default to returning {}', function () {
      expect(Component.state).to.eql({});
    });
  });

  describe('when you listen to an array of stores', function () {
    var OtherStore;

    beforeEach(function () {
      OtherStore = Marty.register(BarStore);
      Component = render(BarComponent);

      Store.replaceState({
        [expectedId]: { foo: 'bar' }
      });

      OtherStore.replaceState({
        [expectedId]: { bar: 'baz' }
      });
    });

    it('should listen to all of the stores', function () {
      expect(Component.state).to.eql({
        foo: { foo: 'bar' },
        bar: { bar: 'baz' }
      });

      expect(getState).to.be.calledThrice;
    });

    class BarStore extends Marty.Store {
      getBar(id) {
        return this.state[id] || null;
      }
    }

    class BarComponent extends Marty.Component {
      constructor(props) {
        super(props);
        this.listenTo = [Store, OtherStore];
      }

      render() {
        return <div>foo</div>;
      }

      getState() {
        getState();
        return {
          foo: Store.getFoo(expectedId),
          bar: OtherStore.getBar(expectedId)
        };
      }
    }
  });

  describe('when the component unmounts', function () {
    var disposable;
    beforeEach(function () {
      disposable = {
        dispose: sinon.spy()
      };

      Store.addChangeListener = function () {
        return disposable;
      };

      Component = render(FooComponent);
      React.unmountComponentAtNode(React.findDOMNode(Component).parentNode);
    });

    it('should stop listening to any stores', function () {
      expect(disposable.dispose).to.be.calledOnce;
    });
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
      getState();
      return {
        foo: Store.getFoo(expectedId)
      };
    }
  }
});