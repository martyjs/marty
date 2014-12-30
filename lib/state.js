var _ = require('underscore');
var UnknownStoreError = require('../errors/unknownStore');

module.exports = {
  setState: setState,
  clearState: clearState,
  serializeState: serializeState
};

function clearState() {
  _.each(this.getStores(), function (store) {
    store.clear();
  });
}

function setState(states) {
  var stores = indexByName(this.getStores());

  _.each(states, function (state, storeName) {
    var store = stores[storeName];

    if (!store) {
      throw new UnknownStoreError(storeName);
    }

    store.setState(state);
  });

  function indexByName(stores) {
    return _.object(_.map(stores, function (store) {
      return store.name;
    }), stores);
  }
}

function serializeState() {
  var state = {};

  _.each(this.getStores(), function (store) {
    if (store.name) {
      state[store.name] = (store.serialize || store.getState)();
    }
  });

  return '(window.__marty||(window.__marty={})).state=' + JSON.stringify(state);
}