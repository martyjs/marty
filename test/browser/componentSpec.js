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
      constructor(props, context) {
        super(props, context);
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

  describe('when I render within a context', function () {
    var context, expectedState;

    beforeEach(function () {
      context = Marty.createContext();
      expectedState = {
        'foo': { foo: 'bar' }
      };

      Store.for(context).replaceState({
        [expectedId]: expectedState.foo
      });

      Component = TestUtils.renderIntoDocument(
        React.createElement(ContextComponent, {
          context: context,
          type: RootComponent
        })
      ).refs.subject;
    });

    it('should add the context to the root element', function () {
      expect(Component.state).to.eql(expectedState);
    });

    it('should pass the context to child elements', function () {
      expect(Component.refs.foo.state).to.eql(expectedState);
      expect(Component.refs.bar.state).to.eql(expectedState);
    });

    describe('when the store changes', function () {
      beforeEach(function () {
        expectedState = {
          'foo': { bar: 'baz' }
        };

        Store.for(context).replaceState({
          [expectedId]: expectedState.foo
        });
      });

      it('should update the component state', function () {
        expect(Component.state).to.eql(expectedState);
      });

      it('should pass the context to child elements', function () {
        expect(Component.refs.foo.state).to.eql(expectedState);
        expect(Component.refs.bar.state).to.eql(expectedState);
      });
    });

    class RootComponent extends Marty.Component {
      constructor(props, context) {
        super(props, context);
        this.listenTo = Store;
      }
      render() {
        return React.createElement('div', null, [
          React.createElement(ChildComponent, { ref: 'foo', key: 'foo' }),
          React.createElement(ChildComponent, { ref: 'bar', key: 'bar' })
        ]);
      }
      getState() {
        return {
          foo: Store.for(this).getFoo(expectedId)
        };
      }
    }

    class ChildComponent extends Marty.Component {
      constructor(props, context) {
        super(props, context);
        this.listenTo = Store;
      }
      render() {
        return React.createElement('div');
      }
      getState() {
        return {
          foo: Store.for(this).getFoo(expectedId)
        };
      }
    }

    class ContextComponent extends React.Component {
      static get childContextTypes() {
        return {
           martyContext: React.PropTypes.object.isRequired
        };
      }
      getChildContext() {
        return {
          martyContext: this.props.context
        };
      }
      render() {
        return React.createElement(this.props.type, { ref: 'subject' });
      }
    }
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
    constructor(props, context) {
      super(props, context);
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