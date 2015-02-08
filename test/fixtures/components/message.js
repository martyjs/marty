var React = require('react');
var Marty = require('../../../index');
var MessageStore = require('../stores/messageStore');

var MessageState = Marty.createStateMixin({
  getState: function () {
    return {
      message: MessageStore(this).getMessage(this.props.source)
    };
  }
});

var Message = React.createClass({
  mixins: [MessageState],
  render: function () {
    var text = this.state.message.when({
      pending: function () {
        return 'pending';
      },
      failed: function () {
        return 'error';
      },
      done: function (message) {
        return message.text;
      }
    });

    return React.createElement('div', { id: 'message' },
      React.createElement('div', { className: 'text' }, text)
    );
  }
});

module.exports = Message;