var _ = require('underscore');
var uuid = require('./utils/uuid');
var Dispatcher = require('./dispatcher');

function Context(container) {
  this.instances = {};
  this.id = uuid.generate();
  this.dispatcher = new Dispatcher();

  _.each(container.types, createInstancesOfType, this);

  function createInstancesOfType(classes, type) {
    var options = {
      context: this,
      dispatcher: this.dispatcher
    };

    this.instances[type] = {};

    _.each(classes, function (clazz) {
      this.instances[type][clazz.id] = container.resolve(
        type,
        clazz.id,
        options
      );
    }, this);
  }
}

Context.prototype = {
  dispose: function () {
    this.instances = null;
    this.dispatcher = null;
  },
  resolve: function (type, id) {
    if (!this.instances[type]) {
      throw new Error('Context does not have any instances of ' + type);
    }

    if (!this.instances[type][id]) {
      throw new Error('Context does not have an instance of the ' + type + ' ' + id);
    }

    return this.instances[type][id];
  }
};

module.exports = Context;