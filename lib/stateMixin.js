var _ = require('lodash');
var trace = require('./diagnostics').trace;
var reservedKeys = ['listenTo', 'getState'];

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
    onStoreChanged: function (state, store) {
      trace.viewUpdatingAfterStoreChanged(config, this, store);
      this.setState(this.getState());
    },
    componentDidMount: function () {
      _.each(config.stores, function (store) {
        trace.viewListeningToStoreChanges(config, this, store);
        store.addChangeListener(this.onStoreChanged);
      }, this);
    },
    componentWillUnmount: function () {
      _.each(config.stores, function (store) {
        store.removeChangeListener(this.onStoreChanged);
        trace.viewStoppedListeningToStoreChanges(config, this, store);
      }, this);
    },
    getState: function () {
      var state = config.getState();

      trace.viewStateIs(this, state);

      return state;
    },
    getInitialState: function () {
      // getState should have view instance as its function context so you can
      // access props and other functions. getInitialState is the first chance
      // we have to get access th view instance.
      if (options.getState) {
        options.getState = _.bind(options.getState, this);
      }

      return this.getState();
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
    var stores = (options.listenTo || []);
    var storesToGetStateFrom = findStoresToGetStateFrom(options);

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    if (!areStores(stores)) {
      throw new Error('Can only listen to stores');
    }

    stores = stores.concat(_.values(storesToGetStateFrom));

    return {
      stores: stores,
      getState: getState
    };

    function getState() {
      var state = _
        .chain(storesToGetStateFrom)
        .map(getStateFromStore)
        .object()
        .value();

      if (options.getState) {
        state = _.extend(state, options.getState());
      }

      return state;

      function getStateFromStore(store, name) {
        return [name, store.getState()];
      }
    }

    function findStoresToGetStateFrom(options) {
      var storesToGetStateFrom = {};

      _.each(_.omit(options, reservedKeys), function (value, key) {
        if (isStore(value)) {
          storesToGetStateFrom[key] = value;
        }
      });

      return storesToGetStateFrom;
    }
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