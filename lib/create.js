var Store = require('./store');
var HttpAPI = require('./httpAPI');
var constants = require('./constants');
var Container = require('./container');
var ActionCreators = require('./actionCreators');

module.exports = {
  createStore: function (options) {
    return new Store(options);
  },
  createHttpAPI: function (options) {
    return new HttpAPI(options);
  },
  createConstants: function (obj) {
    return constants(obj);
  },
  createContainer: function (options) {
    return new Container(options);
  },
  createActionCreators: function (options) {
    return new ActionCreators(options);
  }
};