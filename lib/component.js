var React = require('react');
var _ = require('./utils/mindash');
var log = require('./logger');
var uuid = require('./utils/uuid');
var warnings = require('./warnings');
var Instances = require('./instances');
var StoreObserver = require('./storeObserver');

// React.Component not present in React v0.12 so Marty.Component isn't supported
if (React.Component) {
  class Component extends React.Component {
    constructor(props, context) {
      super(props, context);

      if (!context && warnings.contextNotPassedInToConstructor) {
        log.warn(contextNotPassedInWarning(this));
      }
      this.__id = uuid.type('Component');
      Instances.add(this);
      this.state = this.getState();
    }

    componentDidMount() {
      var observer = new StoreObserver(this, getStoresToListenTo(this));

      Instances.get(this).observer = observer;
    }

    componentWillUnmount() {
      var instance = Instances.get(this);

      if (instance) {
        if (instance.observer) {
          instance.observer.dispose();
        }

        Instances.dispose(this);
      }
    }

    getState() {
      return {};
    }
  }

  Component.contextTypes = {
    marty: React.PropTypes.object
  };

  module.exports = Component;
} else {
  module.exports = null;
}

function contextNotPassedInWarning(component) {
  var suffix;

  if (component.displayName) {
    suffix = `the component ${component.displayName}`;
  } else {
    suffix = `a component`;
  }

  return `Warning: context has not been passed into the superclass constructor of ${suffix}`;
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