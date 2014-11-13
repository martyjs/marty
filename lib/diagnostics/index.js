var DataFlow = require('./dataFlow');
var DATAFLOW_STARTED = 'data-flow-started';
var EventEmitter = require('events').EventEmitter;
var dataFlowEventEmitter = new EventEmitter();

module.exports = {
  createDataFlow: createDataFlow,
  onDataFlowStarted: onDataFlowStarted
};

function createDataFlow() {
  var dataFlow = new DataFlow();

  dataFlowEventEmitter.emit(DATAFLOW_STARTED, dataFlow);

  return dataFlow;
}

// Sort of borrowing pattern form Atom
// http://blog.atom.io/2014/09/16/new-event-subscription-api.html
function onDataFlowStarted(callback) {
  dataFlowEventEmitter.on(DATAFLOW_STARTED, callback);

  return {
    dispose: function () {
      dataFlowEventEmitter.removeListener(DATAFLOW_STARTED, callback);
    }
  };
}