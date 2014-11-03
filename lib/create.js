var _ = require('lodash');
var Store = require('./store');
var HttpAPI = require('./httpAPI');
var constants = require('./constants');
var Container = require('./container');
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
  createContainer: function (options) {
    return new Container(defaults(this, options));
  },
  createActionCreators: function (options) {
    return new ActionCreators(defaults(this, options));
  }
};

function defaults(marty, options) {
  return _.defaults(options, {
    dispatcher: marty.dispatcher
  });
}