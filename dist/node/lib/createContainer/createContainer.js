"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require("../react");
var log = require("../logger");
var _ = require("../utils/mindash");
var uuid = require("../utils/uuid");
var StoreObserver = require("../storeObserver");
var getFetchResult = require("./getFetchResult");
var getClassName = require("../utils/getClassName");

var RESERVED_FUNCTIONS = ["contextTypes", "componentDidMount", "onStoreChanged", "componentWillUnmount", "getInitialState", "getState", "render"];

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error("Must specify an inner component");
  }

  var observer;
  var id = uuid.type("Component");
  var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
  var contextTypes = _.extend({
    marty: React.PropTypes.object
  }, config.contextTypes);

  var Container = React.createClass(_.extend({
    contextTypes: contextTypes,
    componentDidMount: function componentDidMount() {
      var component = {
        id: id,
        displayName: innerComponentDisplayName
      };

      observer = new StoreObserver({
        component: component,
        onStoreChanged: this.onStoreChanged,
        stores: getStoresToListenTo(this.listenTo, component)
      });
    },
    onStoreChanged: function onStoreChanged() {
      this.setState(this.getState());
    },
    componentWillUnmount: function componentWillUnmount() {
      if (observer) {
        observer.dispose();
      }
    },
    getInitialState: function getInitialState() {
      return this.getState();
    },
    getState: function getState() {
      return {
        result: getFetchResult(this)
      };
    },
    done: function done(results) {
      return React.createElement(InnerComponent, _extends({}, this.props, results));
    },
    render: function render() {
      var container = this;

      return this.state.result.when({
        done: function done(results) {
          if (_.isFunction(container.done)) {
            return container.done(results);
          }

          throw new Error("The `done` handler must be a function");
        },
        pending: function pending() {
          if (_.isFunction(container.pending)) {
            return container.pending();
          }

          return React.createElement("div", null);
        },
        failed: function failed(error) {
          if (_.isFunction(container.failed)) {
            return container.failed(error);
          }

          throw error;
        }
      });
    }
  }, _.omit(config, RESERVED_FUNCTIONS)));

  Container.InnerComponent = InnerComponent;
  Container.displayName = innerComponentDisplayName + "Container";

  return Container;
}

module.exports = createContainer;

function getStoresToListenTo(stores, component) {
  if (!stores) {
    return [];
  }

  if (!_.isArray(stores)) {
    stores = [stores];
  }

  return _.filter(stores, function (store) {
    var isStore = store.constructor.type === "Store";

    if (!isStore) {
      log.warn("Warning: Trying to listen to something that isn't a store", store, component.displayName);
    }

    return isStore;
  });
}