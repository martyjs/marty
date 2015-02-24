var React = require('react');
var _ = require('underscore');
var log = require('./logger');
var Context = require('./context');
var uuid = require('./utils/uuid');
var Instances = require('./instances');

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.listenTo = [];
    this.__id = uuid.type('Component');

    Instances.add(this, {
      listeners: []
    });

    this.state = this.getState();
  }

  componentDidMount() {
    var listeners = _.map(
      getStoresToListenTo(this),
      _.bind(listenToStore, this)
    );

    Instances.get(this).listeners = listeners;
  }

  componentWillUnmount() {
    _.invoke(Instances.get(this).listeners, 'dispose');

    Instances.dispose(this);
  }

  getState() {
    return {};
  }

  onStoreChanged(state, store) {
    this.setState(tryGetState(this, store));
  }
}

function tryGetState(component, store) {
  var handler;
  var displayName = component.displayName;

  if (store && store.action) {
    handler = store.action.addViewHandler(displayName, component);
  }

  try {
    return component.getState();
  } catch (e) {
    var errorMessage = 'An error occured while trying to get the latest state in the view ' + component.displayName;

    log.error(errorMessage, e, component);

    if (handler) {
      handler.failed(e);
    }

    return {};
  } finally {
    if (handler) {
      handler.dispose();
    }
  }
}

function listenToStore(store) {
  return store.for(getContext(this))
              .addChangeListener(_.bind(this.onStoreChanged, this));
}

function getContext() {
  return Context.getCurrent();
}

function getStoresToListenTo(component) {
  var stores = component.listenTo;

  if (!stores) {
    return [];
  }

  if (!_.isArray(stores)) {
    stores = [stores];
  }

  return _.filter(stores, function (store) {
    var isStore = store.constructor.type === 'Store';

    if (!isStore) {
      log.warn(
        'Warning: Trying to listen to something that isn\'t a store',
        store,
        component
      );
    }

    return isStore;
  });
}

module.exports = Component;