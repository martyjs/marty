require('isomorphic-fetch');
require('es6-promise').polyfill();

var Marty = require('marty-lib/modules/core/marty').Marty;
var marty = new Marty('0.10.0-alpha', react());

marty.use(require('marty-lib/modules/core'));
marty.use(require('marty-lib/modules/constants'));
marty.use(require('marty-lib/modules/store'));
marty.use(require('marty-lib/modules/action-creators'));
marty.use(require('marty-lib/modules/queries'));
marty.use(require('marty-lib/modules/state-mixin'));
marty.use(require('marty-lib/modules/container'));
marty.use(require('marty-lib/modules/isomorphism'));
marty.use(require('marty-lib/modules/http-state-source'));
marty.use(require('marty-lib/modules/cookie-state-source'));
marty.use(require('marty-lib/modules/location-state-source'));
marty.use(require('marty-lib/modules/session-storage-state-source'));
marty.use(require('marty-lib/modules/json-storage-state-source'));
marty.use(require('marty-lib/modules/local-storage-state-source'));

module.exports = marty;

// Due to [NPM peer dependency issues](https://github.com/npm/npm/issues/5875)
// we need to try resolving react from the parent if its not present locally
function react() {
  try {
    return require('react');
  } catch (e) {
    return module.parent.require('react');
  }
}
