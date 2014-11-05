var React = require('react');
var sinon = require('sinon');
var expect = require('chai').expect;
var StateMixin = require('../lib/stateMixin');
var TestUtils = require('react/addons').addons.TestUtils;

describe('StateMixin', function () {
  var view, mixin, initialState;

  beforeEach(function () {
    initialState = {
      name: 'hello'
    };

    mixin = new StateMixin({
      getInitialiState: sinon.stub().returns(initialState)
    });

    view = TestUtils.renderIntoDocument(React.createClass({
      render: function () {
        return React.createElement('div', null, this.state.name);
      }
    }));
  });

  it.only('should get the initialState from the mixin', function () {
    expect(view.state).to.eql(initialState);
  });
});
