let React = require('../react');
let _ = require('../utils/mindash');

let Context = React.createClass({
  childContextTypes: {
    marty: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {
      marty: this.props.context
    };
  },
  render: function () {
    let subject = this.props.subject;
    let props = _.extend({}, subject.props, { ref: 'subject' });

    return React.createElement(subject.type, props);
  }
});

module.exports = Context;
