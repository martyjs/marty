var _ = require('underscore');

function StateSource(options) {

  extendStateSource(this, options);

  function extendStateSource(stateSource, options) {
    _.extend.apply(_, [stateSource].concat(options.mixins, options));
  }
}

module.exports = StateSource;