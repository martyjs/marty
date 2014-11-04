var _ = require('lodash');
var Store = require('./store');
var HttpAPI = require('./httpAPI');
var constants = require('./constants');
var Dispatcher = require('./dispatcher');
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
  createDispatcher: function (options) {
    var CustomDispatcher = _.extend(Dispatcher, options);

    return new CustomDispatcher();
  }
};

function defaults(marty, options) {
  return _.defaults(options, {
    dispatcher: marty.dispatcher
  });
}