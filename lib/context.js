var _ = require('underscore');
var uuid = require('./utils/uuid');
var Dispatcher = require('./dispatcher');

function Context(container) {
  this.types = {};
  this.id = uuid.generate();
  this.dispatcher = new Dispatcher();

  _.each(container.types, createInstancesOfType, this);

  function createInstancesOfType(classes, type) {
    var options = { dispatcher: this.dispatcher };

    this.types[type] = {};

    _.each(classes, function (clazz) {
      this.types[type][clazz.id] = container.resolve(
        type,
        clazz.id,
        options
      );
    }, this);
  }
}

Context.prototype = {
  resolve: function (type, id) {
    if (!this.types[type]) {
      throw new Error('Context does not have any instances of ' + type);
    }

    if (!this.types[type][id]) {
      throw new Error('Context does not have an instance of the ' + type + ' ' + id);
    }

    return this.types[type][id];
  }
};

module.exports = Context;