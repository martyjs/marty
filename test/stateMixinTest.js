var React = require('react');
var expect = require('chai').expect;
var StateMixin = require('../lib/stateMixin');
var TestUtils = require('react/addons').addons.TestUtils;

describe('StateMixin', function () {
  var View, element, mixin, initialState;

  beforeEach(function () {
    initialState = {
      name: 'hello'
    };

    mixin = new StateMixin({
      getInitialState: function () {
        return initialState;
      }
    });

    View = React.createClass({
      mixins: [mixin],
      render: function () {
        return React.createElement('div', null, this.state.name);
      }
    });

    element = TestUtils.renderIntoDocument(React.createElement(View));
  });

  it('should get the initialState from the mixin', function () {
    expect(element.state).to.eql(initialState);
  });
});