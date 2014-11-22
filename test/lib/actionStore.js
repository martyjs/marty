var diagnostics = require('../../lib/diagnostics');

function ActionStore() {
  var actions = [];
  var subscription = diagnostics.onAction(function (action) {
    actions.push(action);
  });

  this.dispose = function () {
    subscription.dispose();
  };

  Object.defineProperty(this, 'all', {
    get: function () {
      return actions;
    }
  });

  Object.defineProperty(this, 'length', {
    get: function () {
      return actions.length;
    }
  });

  Object.defineProperty(this, 'first', {
    get: function () {
      return actions[0];
    }
  });

  Object.defineProperty(this, 'second', {
    get: function () {
      return actions[1];
    }
  });
}

module.exports = ActionStore;