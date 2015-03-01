var React = require('react');
var _ = require('underscore');

module.exports = function (Marty) {
  var MessageStore, MessageAPI;

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

  class Message extends Marty.Component {
    constructor(props, context) {
      super(props, context);
      this.listenTo = MessageStore;
    }
    render() {
      var message = this.state.message.when({
        pending: function () {
          return {
            text: 'pending'
          };
        },
        failed: function (error) {
          return {
            text: 'error: ' + error
          };
        },
        done: function (message) {
          return message;
        }
      });

      return React.createElement('div', { id: 'message' },
        React.createElement('div', { className: 'text' }, message.text),
        React.createElement('div', { className: 'context' }, message.context)
      );
    }
    getState() {
      return {
        message: MessageStore.for(this).getMessage(this.props.id)
      };
    }
  }

  MessageAPI = Marty.register(_MessageAPI);
  MessageStore = Marty.register(_MessageStore);

  return {
    Message: Message,
    MessageAPI: MessageAPI,
    MessageStore: MessageStore
  };
};