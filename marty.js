require('isomorphic-fetch');
require('es6-promise').polyfill();

var Marty = require('marty-core').Marty;
var marty = new Marty('0.10.0-alpha', react());

marty.use(require('marty-core'));
marty.use(require('marty-constants'));
marty.use(require('marty-store'));
marty.use(require('marty-action-creators'));
marty.use(require('marty-queries'));
marty.use(require('marty-state-mixin'));
marty.use(require('marty-container'));
marty.use(require('marty-isomorphism'));
marty.use(require('marty-http-state-source'));
marty.use(require('marty-cookie-state-source'));
marty.use(require('marty-location-state-source'));
marty.use(require('marty-session-storage-state-source'));
marty.use(require('marty-json-storage-state-source'));
marty.use(require('marty-local-storage-state-source'));

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