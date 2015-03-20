"use strict";

require("es6-promise").polyfill();

var state = require("./lib/state");
var create = require("./lib/create");
var logger = require("./lib/logger");
var _ = require("./lib/utils/mindash");
var dispose = require("./lib/dispose");
var classes = require("./lib/classes");
var warnings = require("./lib/warnings");
var Container = require("./lib/container");
var Dispatcher = require("./lib/dispatcher");
var Diagnostics = require("./lib/diagnostics");
var environment = require("./lib/environment");
var EventEmitter = require("events").EventEmitter;
var renderToString = require("./lib/renderToString");

function createInstance() {
  return _.extend({
    logger: logger,
    dispose: dispose,
    version: "0.9.0-rc2",
    warnings: warnings,
    Dispatcher: Dispatcher,
    Diagnostics: Diagnostics,
    container: new Container(),
    __events: new EventEmitter(),
    renderToString: renderToString,
    createInstance: createInstance
  }, state, create, classes, environment);
}

module.exports = createInstance();