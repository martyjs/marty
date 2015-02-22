var instances = {};
var _ = require('underscore');
var Dispatcher = require('../dispatcher');

var Instances = {
  get(obj) {
    return instances[this.getId(obj)];
  },
  getId(obj) {
    var id = obj.__id;

    if (!id) {
      id = obj.id;
    }

    if (!id) {
      throw new Error('Object does not have an Id');
    }

    return id;
  },
  add(obj, instance) {
    instance = instance || {};

    var id = this.getId(obj);

    if (instances[id]) {
      throw new Error('There is already an instance for the ' + instance.__type + ' ' + id);
    }

    _.defaults(instance, {
      dispatcher: Dispatcher.getDefault()
    });

    instances[id] = instance;

    return instance;
  },
  dispose(obj) {
    delete instances[this.getId(obj)];
  }
};

module.exports = Instances;