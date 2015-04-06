require('isomorphic-fetch');
require('es6-promise').polyfill();

var Marty = require('marty-core/lib/marty');
var marty = new Marty('0.10.0-alpha', require('react'));

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