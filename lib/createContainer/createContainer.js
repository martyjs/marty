var React = require('../react');
var log = require('../logger');
var _ = require('../utils/mindash');
var uuid = require('../utils/uuid');
var StoreObserver = require('../storeObserver');
var getFetchResult = require('./getFetchResult');
var getClassName = require('../utils/getClassName');

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error('Must specify an inner component');
  }

  var observer;
  var id = uuid.type('Component');
  var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);

  var Container = React.createClass({
    contextTypes: {
      marty: React.PropTypes.object
    },
    componentDidMount() {
      var component = {
        id: id,
        displayName: innerComponentDisplayName
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
      config = _.defaults(config, {
        // Have a default implementation of done so it can be
        // called from other handlers
        done: (results) => {
          return <InnerComponent {...this.props} {...results} />;
        }
      });

      return this.getState();
    },
    getState() {
      // Make the context available so you can call `.for(this)` within the handlers
      config.context = this.context.marty;

      // Make props available so you can pass them to the children
      config.props = this.props;

      return {
        result: getFetchResult(config)
      };
    },
    render() {
      return this.state.result.when({
        done(results) {
          if (_.isFunction(config.done)) {
            return config.done.call(config, results);
          }

          throw new Error('The `done` handler must be a function');
        },
        pending() {
          if (_.isFunction(config.pending)) {
            return config.pending.call(config);
          }

          return <div></div>;
        },
        failed(error) {
          if (_.isFunction(config.failed)) {
            return config.failed.call(config, error);
          }

          throw error;
        }
      });
    }
  });

  Container.InnerComponent = InnerComponent;
  Container.displayName = innerComponentDisplayName + 'Container';

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
