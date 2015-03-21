var React = require('react');
var log = require('../logger');
var _ = require('../utils/mindash');
var uuid = require('../utils/uuid');
var StoreObserver = require('../storeObserver');
var getFetchResult = require('./getFetchResult');

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
        onStoreChanged: this.onStoreChanged,
        stores: getStoresToListenTo(config, component)
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
      return {
        result: getFetchResult(config)
      };
    },
    render() {
      var component = this;

      return this.state.result.when({
        done(results) {
          if (_.isFunction(config.done)) {
            return config.done(results, component);
          }

          return <InnerComponent {...component.props} {...results} />;
        },
        pending() {
          if (_.isFunction(config.pending)) {
            return config.pending(component);
          }

          return <div></div>;
        },
        failed(error) {
          if (_.isFunction(config.failed)) {
            return config.failed(error, component);
          }

          throw new Error('Must implement the `failed` handler');
        }
      });
    }
  });

  Container.InnerComponent = InnerComponent;

  return Container;
}

module.exports = createContainer;

function getStoresToListenTo(config, component) {
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
        component.displayName
      );
    }

    return isStore;
  });
}