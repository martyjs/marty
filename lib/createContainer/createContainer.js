let React = require('react');
let log = require('../logger');
let _ = require('../utils/mindash');
let uuid = require('../utils/uuid');
let StoreObserver = require('../storeObserver');
let getFetchResult = require('./getFetchResult');

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error('Must specify an inner component');
  }

  let observer;
  let id = uuid.type('Component');

  let Container = React.createClass({
    contextTypes: {
      marty: React.PropTypes.object
    },
    componentDidMount() {
      let component = {
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
  Container.displayName = InnerComponent.displayName + 'Container';

  return Container;
}

module.exports = createContainer;

function getStoresToListenTo(config, component) {
  let stores = config.listenTo;

  if (!stores) {
    return [];
  }

  if (!_.isArray(stores)) {
    stores = [stores];
  }

  return _.filter(stores, function (store) {
    let isStore = store.constructor.type === 'Store';

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