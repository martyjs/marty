require('isomorphic-fetch');
require('es6-promise').polyfill();

var Marty = require('marty-core/lib/marty');
var marty = new Marty('v0.10.0-beta', require('react'));

marty.use(require('marty-core'));
marty.use(require('marty-store'));
marty.use(require('marty-queries'));
marty.use(require('marty-container'));
marty.use(require('marty-constants'));
marty.use(require('marty-action-creators'));

module.exports = marty;