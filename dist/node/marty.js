"use strict";

require("es6-promise").polyfill();

var state = require("./lib/state");
var create = require("./lib/create");
var logger = require("./lib/logger");
var _ = require("./lib/utils/mindash");
var dispose = require("./lib/dispose");
var classes = require("./lib/classes");
var warnings = require("./lib/warnings");
var Registry = require("./lib/registry");
var Dispatcher = require("./lib/dispatcher");
var Diagnostics = require("./lib/diagnostics");
var environment = require("./lib/environment");
var EventEmitter = require("events").EventEmitter;
var renderToString = require("./lib/renderToString");

function createInstance() {
  return _.extend({
    logger: logger,
    dispose: dispose,
    version: "0.9.9",
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