var React = require('react');
var _ = require('lodash');

module.exports = function (Marty) {
  var MessageStore, MessageAPI, Message;

  class _MessageStore extends Marty.Store {
    constructor(options) {
      super(options);
      this.state = {};
    }

    setContextName(name) {
      this.state.contextName = name;
    }
    addMessage(id, message) {
      this.state[id] = _.extend(message, {
        id: id,
        context: this.state.contextName
      });
    }
    getMessage(id) {
      return this.fetch({
        id: id,
        locally() {
          return this.state[id];
        },
        remotely() {
          return MessageAPI.for(this).getMessage(id);
        }
      });
    }
  }

  class _MessageAPI extends Marty.HttpStateSource {
    constructor(options) {
      super(options);
      this.delay = 10;
    }
    getMessage(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          MessageStore.for(this).addMessage(id, { text: 'remote' });
          resolve();
        }, this.delay);
      });
    }
  }

  class _Message extends React.Component {
    render() {
      var message = this.props.message;

      return React.createElement('div', { id: 'message' },
        React.createElement('div', { className: 'text' }, message.text),
        React.createElement('div', { className: 'context' }, message.context)
      );
    }
  }

  MessageAPI = Marty.register(_MessageAPI);
  MessageStore = Marty.register(_MessageStore);
  Message = Marty.createContainer(_Message, {
    listenTo: MessageStore,
    fetch: {
      message() {
        return MessageStore.for(this).getMessage(this.props.id)
      }
    },
    pending() {
      return this.done({
        message: {
          text: 'pending'
        }
      })
    },
    failed(errors) {
      return this.done({
        message: {
          text: 'error: ' + errors.message
        }
      });
    }
  });

  return {
    Message: Message,
    MessageAPI: MessageAPI,
    MessageStore: MessageStore
  };
};