require('es6-promise').polyfill();

var state = require('./lib/state');
var create = require('./lib/create');
var logger = require('marty-core/lib/logger');
var _ = require('marty-core/lib/utils/mindash');
var classes = require('./lib/classes');
var Registry = require('./lib/registry');
var renderToString = require('./lib/renderToString');
var MartyBuilder = require('marty-core/lib/martyBuilder');

var builder = new MartyBuilder('0.9.7');

require('marty-core/register')(builder);
require('marty-store/register')(builder);
require('marty-constants/register')(builder);

function createInstance() {
  var marty = builder.build();

  return _.extend(marty, {
    registry: new Registry(),
    renderToString: renderToString,
    createInstance: createInstance,
  }, state, create, classes);
}

module.exports = createInstance();