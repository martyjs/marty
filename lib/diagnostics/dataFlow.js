/* jshint ignore:start */

var CHANGE_EVENT = 'changed';
var guid = require('../utils/guid');
var EventEmitter = require('events').EventEmitter;

function DataFlow() {
  var stacktrace = [];
  var emitter = new EventEmitter();



  this.id = guid();
  this.dispose = dispose;
  this.addChangeListener = addChangeListener;
  this.removeChangeListener = removeChangeListener;
  this.enteredActionCreator = enteredActionCreator;
  this.leftActionCreator = leftActionCreator;
  this.enteredHttpAPI = enteredHttpAPI;
  this.leftHttpAPI = leftHttpAPI;
  this.httpRequestMade = httpRequestMade;
  this.storeRegisteredWithDispatcher = storeRegisteredWithDispatcher;
  this.storeHasChanged = storeHasChanged;
  this.viewUpdatingAfterStoreChanged = viewUpdatingAfterStoreChanged;
  this.viewListeningToStoreChanges = viewListeningToStoreChanges;
  this.viewStoppedListeningToStoreChanges = viewStoppedListeningToStoreChanges;
  this.storeHandledPayload = storeHandledPayload;
  this.storeDidNotHandlePayload = storeDidNotHandlePayload;
  this.viewStateIs = viewStateIs;
  this.actionCreated = actionCreated;
  this.storeCreated = storeCreated;
  this.actionCreatorCreated = actionCreatorCreated;
  this.constantsCreated = constantsCreated;
  this.httpAPICreated = httpAPICreated;
  this.stateMixinCreated = stateMixinCreated;
  this.dispatcherCreated = dispatcherCreated;
  this.stateMixinBoundToView = stateMixinBoundToView;

  if (Object.defineProperty) {
    Object.defineProperty(this, 'stacktrace', {
      get: function () {
        return stacktrace;
      }
    });
  } else {
    this.stacktrace = stacktrace;
  }

  addCall({
    id: this.id,
    source: {
      type: 'DataFlow',
      id: this.id
    },
    type: 'started'
  });

  function dispose() {
    addCall({
      id: this.id,
      type: 'finished'
    });
  }

  function removeChangeListener(callback) {
    emitter.removeListener(CHANGE_EVENT, callback);
  }

  function addChangeListener(callback) {
    emitter.on(CHANGE_EVENT, callback);
  }

  function addCall(call) {
    stacktrace.push(call);
    emitter.emit(CHANGE_EVENT, stacktrace);
  }

  function enteredActionCreator(ActionCreator, functionName, arguments) {
    var id = DataFlow.callId();

    addCall({
      id: id,
      source: {
        type: 'ActionCreator',
        id: ActionCreator.name
      },
      type: 'entered',
      function: functionName,
      arguments: arguments
    });

    return id;
  }

  function leftActionCreator(id, returnValue) {
    addCall({
      id: id,
      type: 'left',
      returnValue: returnValue
    });
  }

  function enteredHttpAPI(HttpAPI, functionName, arguments) {

  }

  function leftHttpAPI(id) {

  }

  function httpRequestMade(method, url) {

  }

  function storeRegisteredWithDispatcher(store, dispatchToken) {

  }

  function storeHasChanged(store, store) {

  }

  function viewUpdatingAfterStoreChanged(mixin, view, store) {

  }

  function viewListeningToStoreChanges(mixin, view, store) {

  }

  function viewStoppedListeningToStoreChanges(mixin, view, store) {

  }

  function storeHandledPayload(store, payload, handler) {

  }

  function storeDidNotHandlePayload(store, payload) {

  }

  function viewStateIs(view, state) {

  }

  function actionCreated(action) {

  }

  function storeCreated(Store) {

  }

  function actionCreatorCreated(ActionCreator) {

  }

  function constantsCreated(Constants) {

  }

  function httpAPICreated(HttpAPI) {

  }

  function stateMixinCreated(StateMixin) {

  }

  function dispatcherCreated(Dispatcher) {

  }

  function stateMixinBoundToView(StateMixin, view) {

  }
}

DataFlow.callId = guid;

module.exports = DataFlow;


/* jshint ignore:end */