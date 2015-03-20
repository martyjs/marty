function createContainer(InnerComponent, config) {
  var Container = React.createClass({
    contextTypes: {
      marty: React.PropTypes.object
    },
    getInitialState() {
      this.__id = uuid.type('Component');
      Instances.add(this);

      return {};
    }
    componentDidMount() {
      var observer = new StoreObserver(this, getStoresToListenTo(config));

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
    render: function () {
      var subject = this.props.subject;
      var props = _.extend({}, subject.props, { ref: 'subject' });

      return React.createElement(subject.type, props);
    }
  });
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