"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require("../react");
var log = require("../logger");
var _ = require("../utils/mindash");
var uuid = require("../utils/uuid");
var StoreObserver = require("../storeObserver");
var getFetchResult = require("./getFetchResult");
var getClassName = require("../utils/getClassName");

var RESERVED_FUNCTIONS = ["contextTypes", "componentDidMount", "componentWillReceiveProps", "onStoreChanged", "componentWillUnmount", "getInitialState", "getState", "render"];

function createContainer(InnerComponent, config) {
  config = config || {};

  if (!InnerComponent) {
    throw new Error("Must specify an inner component");
  }

  var id = uuid.type("Component");
  var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
  var contextTypes = _.extend({
    marty: React.PropTypes.object
  }, config.contextTypes);

  var specification = _.extend({
    contextTypes: contextTypes,
    componentDidMount: function componentDidMount() {
      var component = {
        id: id,
        displayName: innerComponentDisplayName
      };

      this.observer = new StoreObserver({
        component: component,
        onStoreChanged: this.onStoreChanged,
        stores: getStoresToListenTo(this.listenTo, component)
      });
    },
    componentWillReceiveProps: function componentWillReceiveProps(props) {
      this.props = props;
      this.setState(this.getState(props));
    },
    onStoreChanged: function onStoreChanged() {
      if (this.isMounted()) {
        this.setState(this.getState());
      }
    },
    componentWillUnmount: function componentWillUnmount() {
      if (this.observer) {
        this.observer.dispose();
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
      return React.createElement(InnerComponent, _extends({ ref: "innerComponent" }, this.props, results));
    },
    getInnerComponent: function getInnerComponent() {
      return this.refs.innerComponent;
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
  }, _.omit(config, RESERVED_FUNCTIONS));

  // Include lifecycle methods if specified in config. We don't need to
  // explicitly handle the ones that aren't in RESERVED_FUNCTIONS.
  specification.componentDidMount = callBoth(specification.componentDidMount, config.componentDidMount);
  specification.componentWillReceiveProps = callBothWithProps(specification.componentWillReceiveProps, config.componentWillReceiveProps);
  specification.componentWillUnmount = callBoth(specification.componentWillUnmount, config.componentWillUnmount);

  var Container = React.createClass(specification);

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

function callBoth(func1, func2) {
  if (_.isFunction(func2)) {
    return function () {
      func1.call(this);
      func2.call(this);
    };
  } else {
    return func1;
  }
}

function callBothWithProps(func1, func2) {
  if (_.isFunction(func2)) {
    return function (props) {
      func1.call(this, props);
      func2.call(this, props);
    };
  } else {
    return func1;
  }
}