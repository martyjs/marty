var React = require('../react');
var log = require('../logger');
var _ = require('../utils/mindash');
var uuid = require('../utils/uuid');
var StoreObserver = require('../storeObserver');
var getFetchResult = require('./getFetchResult');
var getClassName = require('../utils/getClassName');

var RESERVED_FUNCTIONS = [
  'contextTypes',
  'componentDidMount',
  'onStoreChanged',
  'componentWillUnmount',
  'getInitialState',
  'getState',
  'render'
];

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error('Must specify an inner component');
  }

  var observer;
  var id = uuid.type('Component');
  var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
  var contextTypes = _.extend({
    marty: React.PropTypes.object
  }, config.contextTypes);

  var Container = React.createClass(_.extend({
    contextTypes: contextTypes,
    componentDidMount() {
      var component = {
        id: id,
        displayName: innerComponentDisplayName
      };

      observer = new StoreObserver({
        component: component,
        onStoreChanged: this.onStoreChanged,
        stores: getStoresToListenTo(this.listenTo, component)
      });
    },
    componentWillReceiveProps() {
      this.setState(this.getState());
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
        result: getFetchResult(this)
      };
    },
    done(results) {
      return <InnerComponent ref="innerComponent" {...this.props} {...results} />;
    },
    getInnerComponent() {
      return this.refs.innerComponent;
    },
    render() {
      var container = this;

      return this.state.result.when({
        done(results) {
          if (_.isFunction(container.done)) {
            return container.done(results);
          }

          throw new Error('The `done` handler must be a function');
        },
        pending() {
          if (_.isFunction(container.pending)) {
            return container.pending();
          }

          return <div></div>;
        },
        failed(error) {
          if (_.isFunction(container.failed)) {
            return container.failed(error);
          }

          throw error;
        }
      });
    }
  }, _.omit(config, RESERVED_FUNCTIONS)));

  Container.InnerComponent = InnerComponent;
  Container.displayName = innerComponentDisplayName + 'Container';

  return Container;
}

module.exports = createContainer;

function getStoresToListenTo(stores, component) {
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
