var _ = require('underscore');
var log = require('../logger');
var Context = require('../context');
var uuid = require('../utils/uuid');
var Diagnostics = require('../diagnostics');
var reservedKeys = ['listenTo', 'getState', 'getInitialState'];

function StateMixin(options) {
  var config, instanceMethods;

  if (!options) {
    throw new Error('The state mixin is expecting some options');
  }

  if (isStore(options)) {
    config = storeMixinConfig(options);
  } else {
    config = simpleMixinConfig(options);
    instanceMethods = _.omit(options, reservedKeys);
  }

  var mixin = _.extend({
    onStoreChanged: function (state, store) {
      Diagnostics.trace(
        store.displayName, 'store has changed. The', this.displayName, 'component (' + this._marty.id + ') is updating'
      );

      if (this._lifeCycleState === 'UNMOUNTED') {
        log.warn(
          'Warning: Trying to set the state of ',
          this.displayName,
          'component (' + this._marty.id + ') which is unmounted'
        );
      } else {
        this.setState(this.tryGetState(store));
      }
    },
    tryGetState: function (store) {
      var handler;

      if (store && store.action) {
        handler = store.action.addViewHandler(this.displayName, this);
      }

      try {
        return this.getState();
      } catch (e) {
        var errorMessage = 'An error occured while trying to get the latest state in the view ' + this.displayName;

        log.error(errorMessage, e, this);

        if (handler) {
          handler.failed(e);
        }

        return {};
      } finally {
        if (handler) {
          handler.dispose();
        }
      }
    },
    componentDidMount: function () {
      Diagnostics.trace(
        'The', this.displayName,
        'component (' + this._marty.id + ') has mounted.'
      );

      var context = Context.getCurrent();

      this._marty.listeners = _.map(config.stores, function (store) {
        store = store.for(context);

        Diagnostics.trace(
          'The', this.displayName,
          'component  (' + this._marty.id + ') is listening to the', store.displayName, 'store'
        );

        return store.addChangeListener(this.onStoreChanged);
      }, this);
    },
    componentWillReceiveProps: function (nextProps) {
      var oldProps = this.props;
      this.props = nextProps;

      var newState = this.getState();

      this.props = oldProps;
      this.setState(newState);
    },
    componentWillUnmount: function () {
      Diagnostics.trace(
        'The', this.displayName, 'component (' + this._marty.id + ') is unmounting.',
        'It is listening to', this._marty.listeners.length, 'stores'
      );

      _.each(this._marty.listeners, function (listener) {
        listener.dispose();
      });

      this._marty.listeners = [];
    },
    getState: function () {
      return config.getState(this);
    },
    getInitialState: function () {
      var el = this._currentElement;

      if (!this.displayName && el && el.type) {
        this.displayName = el.type.displayName;
      }

      this.state = {};

      this._marty = {
        listeners: [],
        id: uuid.small()
      };

      if (options.getInitialState) {
        this.state = options.getInitialState();
      }

      this.state = _.extend(this.state, this.getState());

      return this.state;
    }
  }, instanceMethods);

  return mixin;

  function storeMixinConfig(store) {
    store = store.for(Context.getCurrent());

    return {
      stores: [store],
      getState: function () {
        return store.getState();
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

    function getState(view) {
      var context = Context.getCurrent();
      var state = _.object(_.map(storesToGetStateFrom, getStateFromStore));

      if (options.getState) {
        try {
          view.__context = context;
          state = _.extend(state, options.getState.call(view));
        } finally {
          view.__context = null;
        }
      }

      return state;

      function getStateFromStore(store, name) {
        var storeForContext = store.for(context);
        return [name, storeForContext.getState()];
      }
    }

    function findStoresToGetStateFrom(options) {
      var storesToGetStateFrom = {};
      _.each(options, function (value, key) {
        if (reservedKeys.indexOf(key) === -1 && isStore(value)) {
          storesToGetStateFrom[key] = value;
        }
      });

      return storesToGetStateFrom;
    }
  }

  function areStores(stores) {
    for (var i = stores.length - 1; i >= 0; i--) {
      if (!isStore(stores[i])) {
        return false;
      }
    }
    return true;
  }

  function isStore(store) {
    return store.getState && store.addChangeListener;
  }
}

module.exports = StateMixin;