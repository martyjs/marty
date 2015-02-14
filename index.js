require('es6-promise').polyfill();

var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var dispose = require('./lib/dispose');
var Container = require('./lib/container');
var Diagnostics = require('./lib/diagnostics');
var EventEmitter = require('events').EventEmitter;
var renderToString = require('./lib/renderToString');

function createInstance() {
  return _.extend({
    dispose: dispose,
    version: '0.8.12',
    Diagnostics: Diagnostics,
    container: new Container(),
    __events: new EventEmitter(),
    renderToString: renderToString,
    createInstance: createInstance
  }, state, create);
}

module.exports = createInstance();
