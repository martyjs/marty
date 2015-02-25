var React = require('react');
var _ = require('underscore');
var log = require('./logger');
var uuid = require('./utils/uuid');
var Instances = require('./instances');
var StoreObserver = require('./storeObserver');

class Component extends React.Component {
  constructor(props) {
    super(props);
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