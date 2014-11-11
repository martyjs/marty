var _ = require('lodash');
var Store = require('./store');
var HttpAPI = require('./httpAPI');
var Constants = require('./constants');
var Dispatcher = require('./dispatcher');
var StateMixin = require('./stateMixin');
// var trace = require('./diagnostics').trace;
var ActionCreators = require('./actionCreators');

module.exports = {
  createStore: function (options) {
    var store = new Store(defaults(this, options));

    // trace.storeCreated(store);

    return store;
  },
  createHttpAPI: function (options) {
    var httpAPI = new HttpAPI(defaults(this, options));

    // trace.httpAPICreated(httpAPI);

    return httpAPI;
  },
  createConstants: function (obj) {
    var constants = Constants(obj);

    // trace.constantsCreated(constants);

    return constants;
  },
  createActionCreators: function (options) {
    var actionCreators = new ActionCreators(defaults(this, options));

    // trace.actionCreatorsCreated(actionCreators);

    return actionCreators;
  },
  createStateMixin: function (options) {
    var stateMixin = new StateMixin(defaults(this, options));

    // trace.stateMixinCreated(stateMixin);

    return stateMixin;
  },
  createDispatcher: function (options) {
    var CustomDispatcher = _.extend(Dispatcher, options);
    var dispatcher = new CustomDispatcher();

    // trace.dispatcherCreated(dispatcher);

    return dispatcher;
  }
};

function defaults(marty, options) {
  return _.defaults(options, {
    dispatcher: marty.dispatcher
  });
}