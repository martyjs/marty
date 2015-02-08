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
    getMessage: function (source) {
      var contextName = this.state.contextName;

      return this.fetch({
        id: source,
        locally: function () {
          if (source === 'locally') {
            return {
              text: 'local-' + contextName
            };
          }
        },
        remotely: function () {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve({
                text: 'remote-' + contextName
              });
            }, 10);
          });
        }
      });
    }
  });

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

  return {
    Message: Message,
    MessageStore: MessageStore
  };
};