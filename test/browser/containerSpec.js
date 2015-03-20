var React = require('react');
var sinon = require('sinon');
var expect = require('chai').expect;
var TestUtils = require('react/addons').addons.TestUtils;

describe('Container', function () {
  var Marty, InnerComponent, ContainerComponent, element, expectedProps, initialProps, updateProps;
  beforeEach(function () {
    updateProps = sinon.spy();

    Marty = require('../../marty').createInstance();

    InnerComponent = React.createClass({
      render() {
        return React.createElement('div');
      },
      getInitialState() {
        initialProps = this.props;
        return {};
      },
      componentWillReceiveProps: updateProps,
      foo() {
        return { bar: 'baz' }
      }
    });
  });

  describe('when I dont pass in an inner component', function () {
    it('should throw an error', function () {
      expect(createContainerWithNoInnerComponent).to.throw(Error);

      function createContainerWithNoInnerComponent() {
        Marty.createContainer();
      }
    });
  });

  describe('when I pass in a simple component', function () {

    beforeEach(function () {
      ContainerComponent = Marty.createContainer(InnerComponent);
    });

    it('should return a renderable component', function () {
      wrap(ContainerComponent);
    });

    it('should make the original component accessible at InnerComponent', function () {
      expect(ContainerComponent.InnerComponent).to.equal(InnerComponent);
    });
  });

  describe('when I pass props to the container component', function () {
    beforeEach(function () {
      expectedProps = { foo: 'bar' };
      element = render(wrap(InnerComponent), expectedProps);
    });

    it('should pass them through to the inner component', function () {
      expect(initialProps).to.eql(expectedProps);
    });
  });

  describe('when I fetch a simple value', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function () {
            return 'bar';
          }
        }
      }));
    });

    it('should pass that value to the inner component via props', function () {
      expect(initialProps).to.eql({ foo: 'bar' });
    });
  });

  describe('when I fetch multiple values', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function () {
            return 'bar';
          },
          bar: function () {
            return { baz: 'bam' };
          }
        }
      }));
    });

    it('should pass each of them to the inner component via props', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when I fetch a value that is done', function () {
    it('should pass that value through to the child');
  });

  describe('when I fetch a pending value and there is a pending handler', function () {
    it('should render the result of the pending handler');
  });

  describe('when I fetch a failed value and there is a failed handler', function () {
    it('should render the result of the failed handler');
    it('should pass in the error');
  });

  function wrap(InnerComponent, containerOptions) {
    return Marty.createContainer(InnerComponent, containerOptions);
  }

  function render(Component, props) {
    return TestUtils.renderIntoDocument(React.createElement(Component, props));
  }
});