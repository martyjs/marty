var _ = require('lodash');
var Store = require('./store');
var HttpAPI = require('./httpAPI');
var Constants = require('./constants');
var Dispatcher = require('./dispatcher');
var StateMixin = require('./stateMixin');
var ActionCreators = require('./actionCreators');
var Diagnostics = require('./diagnostics')

module.exports = {
  createStore: function (options) {
    var store = new Store(defaults(this, options));

    Diagnostics.trace.storeCreated(store);

    return store;
  },
  createHttpAPI: function (options) {
    var httpAPI = new HttpAPI(defaults(this, options));

    Diagnostics.trace.httpAPICreated(httpAPI);

    return httpAPI;
  },
  createConstants: function (obj) {
    var constants = Constants(obj);

    Diagnostics.trace.constantsCreated(constants);

    return constants;
  },
  createActionCreators: function (options) {
    var actionCreators = new ActionCreators(defaults(this, options));

    Diagnostics.trace.actionCreatorsCreated(actionCreators);

    return actionCreators;
  },
  createStateMixin: function (options) {
    var stateMixin = new StateMixin(defaults(this, options));

    Diagnostics.trace.stateMixinCreated(stateMixin);

    return stateMixin;
  },
  createDispatcher: function (options) {
    var CustomDispatcher = _.extend(Dispatcher, options);

    var dispatcher = new CustomDispatcher();

    Diagnostics.trace.dispatcherCreated(store);

    return dispatcher;
  }
};

function defaults(marty, options) {
  return _.defaults(options, {
    dispatcher: marty.dispatcher
  });
}