var Marty = require('../../../index');

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

module.exports = MessageStore;