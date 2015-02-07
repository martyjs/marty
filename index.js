var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');
var Diagnostics = require('./lib/diagnostics');

var Marty = _.extend({
  version: '0.8.10',
  Diagnostics: Diagnostics
}, state, create);

module.exports = Marty;