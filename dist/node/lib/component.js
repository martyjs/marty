"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = require("react");
var _ = require("./utils/mindash");
var log = require("./logger");
var uuid = require("./utils/uuid");
var warnings = require("./warnings");
var Instances = require("./instances");
var StoreObserver = require("./storeObserver");

// React.Component not present in React v0.12 so Marty.Component isn't supported
if (React.Component) {
  (function () {
    var Component = (function (_React$Component) {
      function Component(props, context) {
        _classCallCheck(this, Component);

        _get(Object.getPrototypeOf(Component.prototype), "constructor", this).call(this, props, context);

        if (!context && warnings.contextNotPassedInToConstructor) {
          log.warn(contextNotPassedInWarning(this));
        }
        this.__id = uuid.type("Component");
        Instances.add(this);
        this.state = this.getState();
      }

      _inherits(Component, _React$Component);

      _createClass(Component, {
        componentDidMount: {
          value: function componentDidMount() {
            var observer = new StoreObserver(this, getStoresToListenTo(this));

            Instances.get(this).observer = observer;
          }
        },
        componentWillUnmount: {
          value: function componentWillUnmount() {
            var instance = Instances.get(this);

            if (instance) {
              if (instance.observer) {
                instance.observer.dispose();
              }

              Instances.dispose(this);
            }
          }
        },
        getState: {
          value: function getState() {
            return {};
          }
        }
      });

      return Component;
    })(React.Component);

    Component.contextTypes = {
      marty: React.PropTypes.object
    };

    module.exports = Component;
  })();
} else {
  module.exports = null;
}

function contextNotPassedInWarning(component) {
  var suffix;

  if (component.displayName) {
    suffix = "the component " + component.displayName;
  } else {
    suffix = "a component";
  }

  return "Warning: context has not been passed into the superclass constructor of " + suffix;
}

function getStoresToListenTo(component) {
  var stores = component.listenTo;

  if (!stores) {
    return [];
  }

  if (!_.isArray(stores)) {
    stores = [stores];
  }

  return _.filter(stores, function (store) {
    var isStore = store.constructor.type === "Store";

    if (!isStore) {
      log.warn("Warning: Trying to listen to something that isn't a store", store, component);
    }

    return isStore;
  });
}