var React = require('react');

module.exports = function (Marty) {
  var MessageStore = Marty.createStore({
    id: 'messages',
    displayName: 'Messages',
    getInitialState: function () {
      return {};
    },
    setContextName: function (name) {
      this.state.contextName = name;
    },
    addMessage: function (id, message) {
      this.state[id] = message;
    },
    getMessage: function (source, id) {
      var contextName = this.state.contextName;

      if (source === 'locally') {
        this.addMessage(id, {
          text: 'local-' + contextName
        });
      }

      return this.fetch({
        id: source,
        locally: function () {
          return this.state[id];
        },
        remotely: function () {
          this.addMessage(id, {
            text: 'remote-' + contextName
          });

          return new Promise(function (resolve) {
            setTimeout(resolve, 10);
          });
        }
      });
    }
  });

  var MessageState = Marty.createStateMixin({
    getState: function () {
      return {
        message: MessageStore(this).getMessage(this.props.source, this.props.id)
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
        failed: function (error) {
          return 'error-' + error;
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

  return {
    Message: Message,
    MessageStore: MessageStore
  };
};