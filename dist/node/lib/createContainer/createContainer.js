"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require("../react");
var log = require("../logger");
var _ = require("../utils/mindash");
var uuid = require("../utils/uuid");
var StoreObserver = require("../storeObserver");
var getFetchResult = require("./getFetchResult");
var getClassName = require("../utils/getClassName");

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error("Must specify an inner component");
  }

  var observer;
  var id = uuid.type("Component");
  var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);

  var Container = React.createClass({
    displayName: "Container",

    contextTypes: {
      marty: React.PropTypes.object
    },
    componentDidMount: function componentDidMount() {
      var component = {
        id: id,
        displayName: innerComponentDisplayName
      };

      observer = new StoreObserver({
        component: component,
        onStoreChanged: this.onStoreChanged,
        stores: getStoresToListenTo(config, component)
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
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      config.props = nextProps;
    },
    getInitialState: function getInitialState() {
      config = _.defaults(config, {
        // Have a default implementation of done so it can be
        // called from other handlers
        done: function done(results) {
          return React.createElement(InnerComponent, _extends({}, this.props, results));
        }
      });

      return this.getState();
    },
    getState: function getState() {
      // Make the context available so you can call `.for(this)` within the handlers
      config.context = this.context.marty;

      // Make props available so you can pass them to the children
      config.props = this.props;

      return {
        result: getFetchResult(config)
      };
    },
    render: function render() {
      return this.state.result.when({
        done: function done(results) {
          if (_.isFunction(config.done)) {
            return config.done.call(config, results);
          }

          throw new Error("The `done` handler must be a function");
        },
        pending: function pending() {
          if (_.isFunction(config.pending)) {
            return config.pending.call(config);
          }

          return React.createElement("div", null);
        },
        failed: function failed(error) {
          if (_.isFunction(config.failed)) {
            return config.failed.call(config, error);
          }

          throw error;
        }
      });
    }
  });

  Container.InnerComponent = InnerComponent;
  Container.displayName = innerComponentDisplayName + "Container";

  return Container;
}

module.exports = createContainer;

function getStoresToListenTo(config, component) {
  var stores = config.listenTo;

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