var Store = require('./store');
var HttpAPI = require('./httpAPI');
var constants = require('./constants');
var StateMixin = require('./stateMixin');
var ActionCreators = require('./actionCreators');

module.exports = {
  createStore: function (options) {
    return new Store(defaults(this, options));
  },
  createHttpAPI: function (options) {
    return new HttpAPI(defaults(this, options));
  },
  createConstants: function (obj) {
    return constants(obj);
  },
  createActionCreators: function (options) {
    return new ActionCreators(defaults(this, options));
  },
  createStateMixin: function (options) {
    return new StateMixin(defaults(this, options));
  }
};

function defaults(marty, options) {
  if (!options.dispatcher) {
    options.dispatcher = marty.dispatcher;
  }

  return options;
}