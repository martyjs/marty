let _ = require('../utils/mindash');

function autoDispatch(constant) {
  return function () {
    let args = _.toArray(arguments);

    args.unshift(constant);

    this.dispatch.apply(this, args);
  };
}

module.exports = autoDispatch;