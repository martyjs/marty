"use strict";

var React = require("react");
var _ = require("underscore");

var ContextComponent = React.createClass({
  displayName: "ContextComponent",

  childContextTypes: {
    martyContext: React.PropTypes.object.isRequired
  },
  getChildContext: function getChildContext() {
    return {
      martyContext: this.props.context
    };
  },
  render: function render() {
    var subject = this.props.subject;
    var props = _.extend({}, subject.props, { ref: "subject" });

    return React.createElement(subject.type, props);
  }
});

module.exports = ContextComponent;