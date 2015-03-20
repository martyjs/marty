"use strict";

var log = require("./logger");
var _ = require("./utils/mindash");
var Instances = require("./instances");
var UnknownStoreError = require("./errors/unknownStore");

var SERIALIZED_WINDOW_OBJECT = "__marty";

module.exports = {
  rehydrate: rehydrate,
  dehydrate: dehydrate,
  clearState: clearState,
  replaceState: replaceState
};

function getDefaultStores(context) {
  return context.container.getAllDefaultStores();
}

function clearState() {
  _.each(getDefaultStores(this), function (store) {
    store.clear();
  });
}

function replaceState(states) {
  _.each(getDefaultStores(this), function (store) {
    var id = storeId(store);

    if (states[id]) {
      store.replaceState(states[id]);
    }
  });
}

function rehydrate(storeStates) {
  var stores = indexById(getDefaultStores(this));
  storeStates = storeStates || getStoreStatesFromWindow();

  _.each(storeStates, function (dehydratedStore, storeName) {
    var store = stores[storeName];
    var state = dehydratedStore.state;

    if (!store) {
      throw new UnknownStoreError(storeName);
    }

    var instance = Instances.get(store);

    instance.fetchHistory = dehydratedStore.fetchHistory;

    if (_.isFunction(store.rehydrate)) {
      store.rehydrate(state);
    } else {
      try {
        store.replaceState(state);
      } catch (e) {
        log.error("Failed to rehydrate the state of " + storeName + ". You might be able " + "to solve this problem by implementing Store#rehydrate()");

        throw e;
      }
    }
  });

  function indexById(stores) {
    return _.object(_.map(stores, function (store) {
      return storeId(store);
    }), stores);
  }

  function getStoreStatesFromWindow() {
    if (!window || !window[SERIALIZED_WINDOW_OBJECT]) {
      return;
    }

    return window[SERIALIZED_WINDOW_OBJECT].stores;
  }
}

function dehydrate(context) {
  var dehydratedStores = {};
  var stores = context ? context.getAllStores() : getDefaultStores(this);

  _.each(stores, function (store) {
    var id = storeId(store);

    if (id) {
      var instance = Instances.get(store);

      dehydratedStores[id] = {
        fetchHistory: instance.fetchHistory,
        state: (store.dehydrate || store.getState).call(store)
      };
    }
  });

  dehydratedStores.toString = function () {
    return "(window.__marty||(window.__marty={})).stores=" + JSON.stringify(dehydratedStores);
  };

  dehydratedStores.toJSON = function () {
    return _.omit(dehydratedStores, "toString", "toJSON");
  };

  return dehydratedStores;
}

function storeId(store) {
  return store.constructor.id;
}