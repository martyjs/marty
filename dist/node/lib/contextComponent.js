"use strict";

var React = require("react");
var _ = require("./utils/mindash");

var ContextComponent = React.createClass({
  displayName: "ContextComponent",

  childContextTypes: {
    marty: React.PropTypes.object.isRequired
  },
  getChildContext: function getChildContext() {
    return {
      marty: this.props.context
    };
  },
  render: function render() {
    var subject = this.props.subject;
    var props = _.extend({}, subject.props, { ref: "subject" });

    return React.createElement(subject.type, props);
  }
});

module.exports = ContextComponent;