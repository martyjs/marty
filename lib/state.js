var _ = require('underscore');
var UnknownStoreError = require('../errors/unknownStore');

var SERIALIZED_WINDOW_OBJECT = '__marty';

module.exports = {
  clearState: clearState,
  rehydrateState: rehydrateState,
  serializeState: serializeState,
  setInitialState: setInitialState
};

function getAllStores(context) {
  return context.container.getAllStoreResolvers();
}

function rehydrateState() {
  if (!window || !window[SERIALIZED_WINDOW_OBJECT]) {
    return;
  }

  var serializeState = window[SERIALIZED_WINDOW_OBJECT].state;

  if (serializeState) {
    this.setInitialState(serializeState);
  }
}

function clearState() {
  _.each(getAllStores(this), function (store) {
    store.clear();
  });
}

function setInitialState(states) {
  var stores = indexById(getAllStores(this));

  _.each(states, function (state, storeName) {
    var store = stores[storeName];

    if (!store) {
      throw new UnknownStoreError(storeName);
    }

    store.setInitialState(state);
  });

  function indexById(stores) {
    return _.object(_.map(stores, function (store) {
      return storeId(store);
    }), stores);
  }
}

function serializeState(context) {
  var state = {};
  var stores = context ? context.getAllStores() : getAllStores(this);

  _.each(stores, function (store) {
    var id = storeId(store);

    if (id) {
      state[id] = (store.serialize || store.getState)();
    }
  });

  state.toString = function () {
    return '(window.__marty||(window.__marty={})).state=' + JSON.stringify(state);
  };

  state.toJSON = function () {
    return _.omit(state, 'toString', 'toJSON');
  };

  return state;
}

function storeId(store) {
  return store.id || store.displayName;
}