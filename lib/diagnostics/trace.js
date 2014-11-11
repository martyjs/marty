function Trace() {

}

/* jshint ignore:start */
Trace.prototype = {
  enteredActionCreator: function (ActionCreator, functionName, arguments) {

  },
  leftActionCreator: function (id) {

  },
  enteredHttpAPI: function (HttpAPI, functionName, arguments) {

  },
  leftHttpAPI: function (id) {

  },
  httpRequestMade: function (method, url) {

  },
  storeRegisteredWithDispatcher: function (store, dispatchToken) {

  },
  storeHasChanged: function (store, store) {

  },
  viewUpdatingAfterStoreChanged: function (mixin, view, store) {

  },
  viewListeningToStoreChanges: function (mixin, view, store) {

  },
  viewStoppedListeningToStoreChanges: function (mixin, view, store) {

  },
  storeHandledPayload: function (store, payload, handler) {

  },
  storeDidNotHandlePayload: function (store, payload) {

  },
  viewStateIs: function (view, state) {

  },
  actionCreated: function (action) {

  },
  storeCreated: function (Store) {

  },
  actionCreatorCreated: function (ActionCreator) {

  },
  constantsCreated: function (Constants) {

  },
  httpAPICreated: function (HttpAPI) {

  },
  stateMixinCreated: function (StateMixin) {

  },
  dispatcherCreated: function (Dispatcher) {

  },
  stateMixinBoundToView: function (StateMixin, view) {

  }
};
/* jshint ignore:end */

module.exports = Trace;