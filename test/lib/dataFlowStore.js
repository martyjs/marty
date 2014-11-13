var Diagnostics = require('../../lib/diagnostics');

function DataFlowStore() {
  var dataflows = [];
  var subscription = Diagnostics.onDataFlowStarted(function (dataFlow) {
    dataflows.push(dataFlow);
  });

  this.dispose = function () {
    subscription.dispose();
  };

  Object.defineProperty(this, 'all', {
    get: function () {
      return dataflows;
    }
  });

  Object.defineProperty(this, 'length', {
    get: function () {
      return dataflows.length;
    }
  });

  Object.defineProperty(this, 'first', {
    get: function () {
      return dataflows[0];
    }
  });

  Object.defineProperty(this, 'second', {
    get: function () {
      return dataflows[1];
    }
  });
}

module.exports = DataFlowStore;