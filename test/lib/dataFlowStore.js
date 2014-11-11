var Diagnostics = require('../../lib/diagnostics');

function DataFlowStore() {
  var dataflows = [];

  Diagnostics.addDataFlowStartedListener(function (dataFlow) {
    dataflows.push(dataFlow);
  });

  this.getAll = function () {
    return dataflows;
  };
}

module.exports = DataFlowStore;