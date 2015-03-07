var _ = require('./utils/mindash');
var log = require('./logger');
var UnknownStoreError = require('../errors/unknownStore');

var SERIALIZED_WINDOW_OBJECT = '__marty';

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

  _.each(storeStates, function (state, storeName) {
    var store = stores[storeName];

    if (!store) {
      throw new UnknownStoreError(storeName);
    }

    if (_.isFunction(store.rehydrate)) {
      store.rehydrate(state);
    } else {
      try {
        store.replaceState(state);
      } catch (e) {
        log.error(
          `Failed to rehydrate the state of ${storeName}. You might be able ` +
          `to solve this problem by implementing Store#rehydrate()`
        );

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

    return window[SERIALIZED_WINDOW_OBJECT].state;
  }
}

function dehydrate(context) {
  var state = {};
  var stores = context ? context.getAllStores() : getDefaultStores(this);

  _.each(stores, function (store) {
    var id = storeId(store);

    if (id) {
      state[id] = (store.hydrate || store.getState).call(store);
    }
  });

  state.toString = function () {
    return `(window.__marty||(window.__marty={})).state=${JSON.stringify(state)}`;
  };

  state.toJSON = function () {
    return _.omit(state, 'toString', 'toJSON');
  };

  return state;
}

function storeId(store) {
  return store.constructor.id;
}