require('es6-promise').polyfill();

let state = require('./lib/state');
let create = require('./lib/create');
let logger = require('./lib/logger');
let _ = require('./lib/utils/mindash');
let dispose = require('./lib/dispose');
let classes = require('./lib/classes');
let warnings = require('./lib/warnings');
let Registry = require('./lib/registry');
let Dispatcher = require('./lib/dispatcher');
let Diagnostics = require('./lib/diagnostics');
let environment = require('./lib/environment');
let EventEmitter = require('events').EventEmitter;
let renderToString = require('./lib/renderToString');

function createInstance() {
  return _.extend({
    logger: logger,
    dispose: dispose,
    version: '0.9.0',
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