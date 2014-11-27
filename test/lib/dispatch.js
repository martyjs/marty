var _ = require('lodash-node');
var DispatchMixin = require('../../lib/mixins/dispatchMixin');

function dispatch() {
  var dispatcher = getDispatcher();

  return dispatcher.dispatch.apply(dispatcher, arguments);
}

function getDispatcher() {
  return _.extend({
    __dispatcher: require('../../index').dispatcher,
  }, DispatchMixin);
}

module.exports = dispatch;