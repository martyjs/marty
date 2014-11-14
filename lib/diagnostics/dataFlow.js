var _ = require('lodash');
var uuid = require('../utils/guid');

function DataFlow(instigator) {
  this.id = uuid();
  this.payload = null;
  this.toJSON = toJSON;
  this.instigator = instigator;
  this.addHandler = addHandler;

  function addHandler() {

  }

  function toJSON() {
    return _.pick('instigator', 'payload', 'handers');
  }
}

module.exports = DataFlow;