"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var log = require("./logger");
var _ = require("./utils/mindash");

var StoreObserver = (function () {
  function StoreObserver(options) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    options = options || {};

    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    this.listeners = _.map(options.stores, function (store) {
      return _this.listenToStore(store);
    });
  }

  _createClass(StoreObserver, {
    dispose: {
      value: function dispose() {
        _.invoke(this.listeners, "dispose");
      }
    },
    listenToStore: {
      value: function listenToStore(store) {
        var _this = this;

        var component = this.component;
        var storeDisplayName = store.displayName || store.id;

        log.trace("The " + component.displayName + " component  (" + component.id + ") is listening to the " + storeDisplayName + " store");

        return store["for"](component).addChangeListener(function (state, store) {
          var storeDisplayName = store.displayName || store.id;

          log.trace("" + storeDisplayName + " store has changed. " + ("The " + _this.component.displayName + " component (" + _this.component.id + ") is updating"));

          if (store && store.action) {
            store.action.addComponentHandler({
              displayName: _this.component.displayName
            }, store);
          }

          _this.onStoreChanged(store);
        });
      }
    }
  });

  return StoreObserver;
})();

module.exports = StoreObserver;