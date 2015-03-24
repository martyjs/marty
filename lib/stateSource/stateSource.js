let log = require('../logger');
let uuid = require('../utils/uuid');
let warnings = require('../warnings');
let Instances = require('../instances');
let resolve = require('../utils/resolve');
let Environment = require('../environment');

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