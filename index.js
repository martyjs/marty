var _ = require('underscore');
var state = require('./lib/state');
var create = require('./lib/create');

var Marty = _.extend({
  version: '0.6.4',
}, state, create);

module.exports = Marty;