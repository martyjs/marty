var _ = require('lodash');

function StateMixin(options) {
  if (!options) {
    throw new Error("The state mixin is expecting some options");
  }

  var listenTo = options.listenTo || [];

  if (!_.isArray(listenTo)) {
    listenTo = [listenTo];
  }

  if(!areStores(listenTo)) {
    throw new Error('Can only listen to stores');
  }

  var mixin = {
    onStoreChanged: function () {
      this.setState(options.getState());
    },
    componentDidMount: function () {
      _.each(listenTo, function (store) {
        store.addChangeListener(this.onStoreChanged);
      }, this);
    },
    componentWillUnmount: function () {
      _.each(listenTo, function (store) {
        store.removeChangeListener(this.onStoreChanged);
      }, this);
    },
    getInitialState: function () {
      return options.getState();
    }
  };

  return mixin;

  function areStores(stores) {
    return _.every(listenTo, isStore);
  }

  function isStore(store) {
    return store.addChangeListener &&
           store.removeChangeListener;
  }
}

module.exports = StateMixin;