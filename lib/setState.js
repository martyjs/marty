var _ = require('./utils/tinydash');
var UnknownStoreError = require('./errors/unknownStore');

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

module.exports = setState;