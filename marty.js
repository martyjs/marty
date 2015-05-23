require('isomorphic-fetch');
require('es6-promise').polyfill();

var Marty = require('marty-lib/modules/core/marty');
var marty = new Marty('0.10.0-beta', require('react/addons'));

marty.use(require('marty-lib/modules/core'));
marty.use(require('marty-lib/modules/constants'));
marty.use(require('marty-lib/modules/application'));
marty.use(require('marty-lib/modules/store'));
marty.use(require('marty-lib/modules/action-creators'));
marty.use(require('marty-lib/modules/queries'));
marty.use(require('marty-lib/modules/state-mixin'));
marty.use(require('marty-lib/modules/inject-mixin'));
marty.use(require('marty-lib/modules/container'));
marty.use(require('marty-lib/modules/http-state-source'));
marty.use(require('marty-lib/modules/cookie-state-source'));
marty.use(require('marty-lib/modules/location-state-source'));
marty.use(require('marty-lib/modules/session-storage-state-source'));
marty.use(require('marty-lib/modules/json-storage-state-source'));
marty.use(require('marty-lib/modules/local-storage-state-source'));

module.exports = marty;