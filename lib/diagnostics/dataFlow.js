var uuid = require('../utils/guid');
var _ = require('../utils/tinydash');
var isImuttable = require('../utils/isImmutable');

function DataFlow(options) {
  this.id = uuid();
  this.handlers = [];
  this.payload = null;
  this.toJSON = toJSON;
  this.instigator = instigator(options);
  this.addStoreHandler = addStoreHandler;

  function addStoreHandler(store, handler) {
    this.handlers.push({
      name: store.name,
      type: 'Store',
      handler: handler,
      state: {
        before: getStoreState(store),
        after: null
      }
    });

    function getStoreState(store) {
      if (isImuttable(store.state)) {
        return store.state;
      }

      return _.clone(store.state);
    }
  }

  function instigator(options) {
    var inst = options.instigator;

    return {
      name: inst.name,
      type: inst.type,
      action: inst.action,
      arguments: _.toArray(inst.arguments)
    };
  }

  function toJSON() {
    return {
      payload: this.payload,
      handlers: this.handlers,
      instigator: this.instigator
    };
  }
}

module.exports = DataFlow;