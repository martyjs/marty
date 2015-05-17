var React = require('react');

module.exports = function (Marty) {
  var MessageStore = Marty.createStore({
    id: 'MessageStore',
    getInitialState() {
      return {}
    },
    getMessage(message) {
      return this.fetch({
        id: message,
        locally() {
          return this.state[message];
        },
        remotely() {
          return new Promise(resolve => {
            setTimeout(() => {
              this.state[message] = message;
              resolve();
            }, 10);
          });
        }
      })
    }
  });

  var Child = React.createClass({
    render() {
      return <span id="child">{this.props.message}</span>;
    }
  });

  var ChildContainer = Marty.createContainer(Child, {
    fetch: {
      message() {
        return MessageStore.for(this).getMessage('Child');
      }
    }
  });

  var Parent = React.createClass({
    render() {
      return (
        <div>
          <span id="parent">{this.props.message}</span>;
          <ChildContainer />
        </div>
      );
    }
  });

  return Marty.createContainer(Parent, {
    fetch: {
      message() {
        return MessageStore.for(this).getMessage('Parent');
      }
    }
  });
};