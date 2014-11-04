var _ = require('lodash');
var util = require('util');
var CHANGE_EVENT = 'changed';
var EventEmitter = require('events').EventEmitter;

function Store(options) {
  EventEmitter.call(this);
  _.extend(this, options);

  this.dispatchToken = options.dispatcher.register(this.handlePayload);
  this.initialize.apply(this, arguments);
}

util.inherits(Store, EventEmitter);

Store.prototype = _.extend(Store.prototype, {
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
  handlePayload: function (payload) {
    _.each(this.handlers, function (actionTypes, handler) {
      _.isArray(actionTypes) || (actionTypes = [actionTypes]);
      _.each(actionTypes, function (actionType) {
        if (payload.actionType === actionType) {
          this[handler].call(this, payload.data);
        }
      }, this);
    }, this);
  }
});

module.exports = Store;