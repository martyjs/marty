var _ = require('lodash');

function StateMixin(options) {
  var config;

  if (!options) {
    throw new Error('The state mixin is expecting some options');
  }

  if (isStore(options)) {
    config = storeMixinConfig(options);
  } else {
    config = simpleMixinConfig(options);
  }

  var mixin = {
    onStoreChanged: function () {
      this.setState(config.getState());
    },
    componentDidMount: function () {
      _.each(config.stores, function (store) {
        store.addChangeListener(this.onStoreChanged);
      }, this);
    },
    componentWillUnmount: function () {
      _.each(config.stores, function (store) {
        store.removeChangeListener(this.onStoreChanged);
      }, this);
    },
    getInitialState: function () {
      return config.getState();
    }
  };

  return mixin;

  function storeMixinConfig(store) {
    return {
      stores: [store],
      getState: function () {
        return store.state;
      }
    };
  }

  function simpleMixinConfig(options) {
    var stores = options.listenTo || [];

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    if (!areStores(stores)) {
      throw new Error('Can only listen to stores');
    }

    return {
      stores: stores,
      getState: options.getState
    };
  }

  function areStores(stores) {
    return _.every(stores, isStore);
  }

  function isStore(store) {
    return store.getState &&
           store.addChangeListener &&
           store.removeChangeListener;
  }
}

module.exports = StateMixin;