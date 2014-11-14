var _ = require('lodash');
var uuid = require('../utils/guid');
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
    var obj = _.pick(options.instigator, 'name', 'type', 'action');

    obj.arguments = _.toArray(options.instigator.arguments);

    return obj;
  }

  function toJSON() {
    return _.pick(this, 'instigator', 'payload', 'handlers');
  }
}

module.exports = DataFlow;