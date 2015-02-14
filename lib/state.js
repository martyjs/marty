var _ = require('underscore');
var UnknownStoreError = require('../errors/unknownStore');

module.exports = {
  clearState: clearState,
  serializeState: serializeState,
  setInitialState: setInitialState
};

function clearState() {
  _.each(this.getStores(), function (store) {
    store.clear();
  });
}

function setInitialState(states) {
  var stores = indexById(this.getStores());

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

function serializeState() {
  var state = {};

  _.each(this.getStores(), function (store) {
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