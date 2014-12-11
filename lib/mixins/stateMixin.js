var uuid = require('../utils/uuid');
var _ = require('../utils/tinydash');
var Diagnostics = require('../diagnostics');
var cloneState = require('../utils/cloneState');
var reservedKeys = ['listenTo', 'getState', 'getInitialState', 'listenToActions'];

function StateMixin(options) {
  var config, instanceMethods;
  var listenToActions = shouldListenToActions(options);

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
        store.name, 'store has changed. The', this.name, 'component (' + this._marty.id + ') is updating'
      );

      if (this._lifeCycleState === 'UNMOUNTED') {
        Diagnostics.warn(
          'Trying to set the state of ', this.name, 'component (' + this._marty.id + ') which is unmounted'
        );
      } else {
        this.setState(this.tryGetState(store));
      }
    },
    onActionChanged: function (state, store, actionToken) {
      var nextState = this.tryGetState(store);

      if (!nextState) {
        return;
      }

      if (isActionThatChanged(nextState) || _.any(_.map(nextState, isActionThatChanged))) {
        this.setState(nextState);
      }

      function isActionThatChanged(action) {
        return action && action.token === actionToken;
      }
    },
    tryGetState: function (store) {
      var handler;

      if (Diagnostics.enabled && store && store.action) {
        handler = store.action.addViewHandler(options.name, this, this._marty.lastState);
      }

      try {
        return this.getState();
      } catch (e) {
        if (handler) {
          handler.failed(e);
        }

        return {};
      } finally {
        if (handler) {
          handler.dispose();
          this._marty.lastState = cloneState(this.state);
        }
      }
    },
    componentDidMount: function () {
      Diagnostics.trace(
        'The', this.name,
        'component (' + this._marty.id + ') has mounted.'
      );

      var ActionsStore = require('../stores/actionsStore');

      this._marty.listeners = _.map(config.stores, function (store) {
        Diagnostics.trace(
          'The', this.name,
          'component  (' + this._marty.id + ') is listening to the', store.name, 'store'
        );

        return store.addChangeListener(this.onStoreChanged);
      }, this);

      if (listenToActions) {
        this._marty.listeners.push(
          ActionsStore.addChangeListener(this.onActionChanged)
        );
      }
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
        'The', this.name, 'component (' + this._marty.id + ') is unmounting.',
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
      this.state = {};

      this._marty = {
        listeners: [],
        id: uuid.small(),
        lastState: undefined
      };

      if (options.getInitialState) {
        this.state = options.getInitialState();
      }

      this.state = _.extend(this.state, this.getState());

      if (Diagnostics.enabled) {
        this._marty.lastState = cloneState(this.state);
      }

      return this.state;
    }
  }, instanceMethods);

  return mixin;

  function storeMixinConfig(store) {
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
      var state = _.object(_.map(storesToGetStateFrom, getStateFromStore));

      if (options.getState) {
        state = _.extend(state, options.getState.call(view));
      }

      return state;

      function getStateFromStore(store, name) {
        return [name, store.getState()];
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

  function shouldListenToActions(options) {
    return _.isUndefined(options.listenToActions) || !!options.listenToActions;
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