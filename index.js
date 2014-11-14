var create = require('./lib/create');
var _ = require('./lib/utils/tinydash');
var Dispatcher = require('./lib/dispatcher');

var Marty = _.extend({
  dispatcher: new Dispatcher()
}, create);

module.exports = Marty;