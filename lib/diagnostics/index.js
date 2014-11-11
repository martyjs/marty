var DataFlow = require('./dataFlow');
var DATAFLOW_STARTED = 'data-flow-started';
var EventEmitter = require('events').EventEmitter;
var dataFlowEventEmitter = new EventEmitter();

module.exports = {
  createDataFlow: createDataFlow,
  addDataFlowStartedListener: addDataFlowStartedListener,
  removeDataFlowStartedListener: removeDataFlowStartedListener
};

function createDataFlow() {
  var dataFlow = new DataFlow();

  dataFlowEventEmitter.emit(DATAFLOW_STARTED, dataFlow);

  return dataFlow;
}

function addDataFlowStartedListener(callback) {
  dataFlowEventEmitter.on(DATAFLOW_STARTED, callback);
}

function removeDataFlowStartedListener(callback) {
  dataFlowEventEmitter.off(DATAFLOW_STARTED, callback);
}