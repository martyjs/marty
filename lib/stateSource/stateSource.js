var log = require('marty-core/lib/logger');
var uuid = require('marty-core/lib/utils/uuid');
var warnings = require('marty-core/lib/warnings');
var Instances = require('marty-core/lib/instances');
var resolve = require('marty-core/lib/utils/resolve');
var Environment = require('marty-core/lib/environment');

class StateSource {
  constructor(options) {
    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    this.__type = 'StateSource';
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);
  }

  get context() {
    return Instances.get(this).context;
  }

  for (obj) {
    return resolve(this, obj);
  }

  dispose() {
    Instances.dispose(this);
  }
}

module.exports = StateSource;