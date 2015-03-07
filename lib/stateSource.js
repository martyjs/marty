var _ = require('./utils/mindash');
var HttpStateSource = require('./stateSources/http');
var JSONStorageStateSource = require('./stateSources/jsonStorage');
var LocalStorageStateSource = require('./stateSources/localStorage');
var SessionStorageStateSource = require('./stateSources/sessionStorage');

function StateSource(options) {
  options = options || {};
  extendStateSource(this, options);

  function extendStateSource(stateSource, options) {
    _.extend.apply(_, [stateSource].concat(
      options,
      options.mixins,
      stateSourceMixin(options))
    );
  }

  function stateSourceMixin(options) {
    switch (options.type) {
      case 'http':
        return HttpStateSource(options);
      case 'jsonStorage':
        return JSONStorageStateSource(options);
      case 'localStorage':
        return LocalStorageStateSource(options);
      case 'sessionStorage':
        return SessionStorageStateSource(options);
    }
  }
}

module.exports = StateSource;