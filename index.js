var create = require('./lib/create');
var _ = require('./lib/utils/tinydash');
var Dispatcher = require('./lib/dispatcher');
var constants = require('./lib/internalConstants');

var Marty = _.extend({
  constants: constants,
  dispatcher: new Dispatcher()
}, create);

module.exports = Marty;