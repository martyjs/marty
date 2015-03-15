"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var log = require("./logger");
var _ = require("./utils/mindash");

var StoreObserver = (function () {
  function StoreObserver(component, stores) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    this.component = component;
    this.listeners = _.map(stores, function (store) {
      return _this.listenToStore(store, component);
    });
  }

  _createClass(StoreObserver, {
    dispose: {
      value: function dispose() {
        _.invoke(this.listeners, "dispose");
      }
    },
    listenToStore: {
      value: function listenToStore(store, component) {
        var _this = this;

        var storeDisplayName = store.displayName || store.id;

        log.trace("The " + component.displayName + " component  (" + component.__id + ") is listening to the " + storeDisplayName + " store");

        return store["for"](component).addChangeListener(function (state, store) {
          _this.onStoreChanged(state, store, component);
        });
      }
    },
    onStoreChanged: {
      value: function onStoreChanged(state, store, component) {
        var storeDisplayName = store.displayName || store.id;

        log.trace("" + storeDisplayName + " store has changed. The " + component.displayName + " component (" + component.__id + ") is updating");

        if (component._lifeCycleState === "UNMOUNTED") {
          log.warn("Warning: Trying to set the state of " + component.displayName + " component (" + component.__id + ") which is unmounted");
        } else {
          component.setState(tryGetState(component, store));
        }
      }
    }
  });

  return StoreObserver;
})();

function tryGetState(component, store) {
  var handler;
  var displayName = component.displayName;

  if (store && store.action) {
    handler = store.action.addViewHandler(displayName, component);
  }

  try {
    return component.getState();
  } catch (e) {
    var errorMessage = "An error occured while trying to get the latest state in the view " + component.displayName;

    log.error(errorMessage, e, component);

    if (handler) {
      handler.failed(e);
    }

    throw e;
  } finally {
    if (handler) {
      handler.dispose();
    }
  }
}

module.exports = StoreObserver;