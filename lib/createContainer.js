var React = require('react');
var log = require('./logger');
var _ = require('./utils/mindash');
var uuid = require('./utils/uuid');
var StoreObserver = require('./storeObserver');

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error('Must specify an inner component');
  }

  var observer;
  var id = uuid.type('Component');

  var Container = React.createClass({
    contextTypes: {
      marty: React.PropTypes.object
    },
    componentDidMount() {
      var component = {
        id: id,
        displayName: InnerComponent.displayName
      };

      observer = new StoreObserver({
        component: component,
        stores: getStoresToListenTo(config),
        onStoreChanged: this.onStoreChanged,
      });
    },
    onStoreChanged() {
      this.setState(this.getState());
    },
    componentWillUnmount() {
      if (observer) {
        observer.dispose();
      }
    },
    getInitialState() {
      return this.getState();
    },
    getState() {
      return getFetches(config);
    },
    render() {
      return <InnerComponent {...this.props} {...this.state} />;
    }
  });

  Container.InnerComponent = InnerComponent;

  return Container;
}

module.exports = createContainer;

function getFetches(config) {
  var fetches = {};

  _.each(config.fetch, (value, key) => {
    if (!_.isFunction(value)) {
      log.warn(`The fetch ${key} was not a function and so ignoring`);
    } else {
      fetches[key] = value();
    }
  });

  return fetches;
}

function getStoresToListenTo(config) {
  var stores = config.listenTo;

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