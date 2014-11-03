var _ = require('lodash');
var Marty = require('..');
var CHANGE_EVENT = 'changed';
var EventEmitter = require('events').EventEmitter;

function Store(options) {
  var dispatcher = options.dispatcher || Marty.dispatcher;

  _.extend(this, options);

  this.dispatchToken = dispatcher.register(this.onPayload);
  this.initialize.apply(this, arguments);
}

Store.prototype = _.extend({
  handlers: {},
  initialize: function () { },
  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },
  hasChanged: function () {
    this.emit(CHANGE_EVENT);
  },
  onPayload: function (payload) {
    _.each(this.handlers, function (actionType, handler) {
      if (payload.actionType === actionType) {
        if (this[handler]) {
          this[handler].call(this, payload);
        }
      }
    }, this);
  }
}, EventEmitter);

module.exports = Store;