var React = require('../react');
var _ = require('../utils/mindash');

var Context = React.createClass({
  childContextTypes: {
    marty: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {
      marty: this.props.context
    };
  },
  render: function () {
    var subject = this.props.subject;
    var props = _.extend({}, subject.props, { ref: 'subject' });

    return React.createElement(subject.type, props);
  }
});

module.exports = Context;
