var log = require('marty-core/lib/logger');
var uuid = require('marty-core/lib/utils/uuid');
var warnings = require('./warnings');
var Instances = require('marty-core/lib/instances');
var resolve = require('marty-core/lib/utils/resolve');
var Environment = require('marty-core/lib/environment');

class DispatchCoordinator {
  constructor(type, options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    this.__type = type;
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);
  }

  dispatch(type, ...args) {
    var dispatcher = getInstance(this).dispatcher;

    return dispatcher.dispatchAction({
      type: type,
      arguments: args
    });
  }

  for (obj) {
    return resolve(this, obj);
  }

  get context() {
    return getInstance(this).context;
  }
}

function getInstance(creators) {
  return Instances.get(creators);
}

module.exports = DispatchCoordinator;