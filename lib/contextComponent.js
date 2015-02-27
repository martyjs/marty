var React = require('react');
var _ = require('underscore');

var ContextComponent = React.createClass({
  childContextTypes: {
    martyContext: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {
      martyContext: this.props.context
    };
  },
  render: function () {
    var subject = this.props.subject;
    var props = _.extend(subject.props, { ref: 'subject' });

    return React.createElement(subject.type, props);
  }
});

module.exports = ContextComponent;