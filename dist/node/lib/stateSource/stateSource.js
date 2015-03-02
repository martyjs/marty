"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var log = require("../logger");
var uuid = require("../utils/uuid");
var warnings = require("../warnings");
var Instances = require("../instances");
var resolve = require("../utils/resolve");
var Environment = require("../environment");

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn("Warning: Options were not passed into a state source's constructor");
    }

    this.__type = "StateSource";
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);
  }

  _prototypeProperties(StateSource, null, {
    context: {
      get: function () {
        return Instances.get(this).context;
      },
      configurable: true
    },
    "for": {
      value: function _for(obj) {
        return resolve(this, obj);
      },
      writable: true,
      configurable: true
    },
    dispose: {
      value: function dispose() {
        Instances.dispose(this);
      },
      writable: true,
      configurable: true
    }
  });

  return StateSource;
})();

module.exports = StateSource;