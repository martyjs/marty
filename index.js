var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');

var Marty = _.extend({
  version: '0.7.0-alpha',
}, state, create);

module.exports = Marty;