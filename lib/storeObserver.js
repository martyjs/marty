var log = require('./logger');
var _ = require('marty-core/lib/utils/mindash');

class StoreObserver {
  constructor(options) {
    options = options || {};

    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    this.listeners = _.map(options.stores, (store) => {
      return this.listenToStore(store);
    });
  }

  dispose() {
    _.invoke(this.listeners, 'dispose');
  }

  listenToStore(store) {
    var component = this.component;
    var storeDisplayName = store.displayName || store.id;

    log.trace(
      `The ${component.displayName} component  (${component.id}) is listening to the ${storeDisplayName} store`
    );

    return store.for(component).addChangeListener((state, store) => {
      var storeDisplayName = store.displayName || store.id;

      log.trace(
        `${storeDisplayName} store has changed. ` +
        `The ${this.component.displayName} component (${this.component.id}) is updating`
      );

      if (store && store.action) {
        store.action.addComponentHandler({
          displayName: this.component.displayName
        }, store);
      }

      this.onStoreChanged(store);
    });
  }
}

module.exports = StoreObserver;