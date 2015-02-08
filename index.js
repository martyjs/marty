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
  return _.extend(new EventEmitter(), {
    dispose: dispose,
    version: '0.8.10',
    Diagnostics: Diagnostics,
    container: new Container(),
    renderToString: renderToString,
    createInstance: createInstance
  }, state, create);
}

module.exports = createInstance();
