var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var dispose = require('./lib/dispose');
var Container = require('./lib/container');
var Diagnostics = require('./lib/diagnostics');
var renderToString = require('./lib/renderToString');

var Marty = _.extend({
  dispose: dispose,
  version: '0.8.10',
  Diagnostics: Diagnostics,
  container: new Container(),
  renderToString: renderToString
}, state, create);


module.exports = Marty;