require('es6-promise').polyfill();

var state = require('./lib/state');
var create = require('./lib/create');
var logger = require('marty-core/lib/logger');
var _ = require('marty-core/lib/utils/mindash');
var dispose = require('./lib/dispose');
var classes = require('./lib/classes');
var warnings = require('marty-core/lib/warnings');
var Registry = require('./lib/registry');
var Dispatcher = require('marty-core/lib/dispatcher');
var Diagnostics = require('marty-core/lib/diagnostics');
var environment = require('marty-core/lib/environment');
var EventEmitter = require('events').EventEmitter;
var renderToString = require('./lib/renderToString');
var MartyBuilder = require('marty-core/lib/martyBuilder');

var builder = new MartyBuilder('0.9.7');

require('marty-store/register')(builder);
require('marty-constants/register')(builder);

function createInstance() {
  var marty = builder.build();


  return _.extend(marty, {
    logger: logger,
    dispose: dispose,
    warnings: warnings,
    dispatcher: Dispatcher,
    diagnostics: Diagnostics,
    registry: new Registry(),
    __events: new EventEmitter(),
    renderToString: renderToString,
    createInstance: createInstance,

    // Legacy
    Dispatcher: Dispatcher,
    Diagnostics: Diagnostics
  }, state, create, classes, environment);
}

module.exports = createInstance();