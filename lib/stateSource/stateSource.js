var uuid = require('../utils/uuid');
var Instances = require('../instances');
var resolve = require('../utils/resolve');

class StateSource {
  constructor(options) {
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