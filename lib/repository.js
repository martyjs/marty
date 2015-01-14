var _ = require('underscore');

function Repository(options) {

  extendRepository(this, options);

  function extendRepository(repository, options) {
    _.extend.apply(_, [repository].concat(options.mixins, options));
  }

}

module.exports = Repository;