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
      return store.displayName;
    }), stores);
  }
}

function serializeState() {
  var state = {};

  _.each(this.getStores(), function (store) {
    if (store.displayName) {
      state[store.displayName] = (store.serialize || store.getState)();
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