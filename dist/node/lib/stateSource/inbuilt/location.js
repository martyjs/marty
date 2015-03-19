"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("../../utils/mindash");
var StateSource = require("../stateSource");
var locationFactory = defaultLocationFactory;

var LocationStateSource = (function (_StateSource) {
  function LocationStateSource(options) {
    _classCallCheck(this, LocationStateSource);

    _get(Object.getPrototypeOf(LocationStateSource.prototype), "constructor", this).call(this, options);
    this._isLocationStateSource = true;
  }

  _inherits(LocationStateSource, _StateSource);

  _createClass(LocationStateSource, {
    getLocation: {
      value: function getLocation(location) {
        return locationFactory(location);
      }
    }
  }, {
    setLocationFactory: {
      value: function setLocationFactory(value) {
        locationFactory = value;
      }
    }
  });

  return LocationStateSource;
})(StateSource);

function defaultLocationFactory(location) {
  var l = location || window.location;

  return {
    url: l.url,
    path: l.pathname,
    hostname: l.hostname,
    query: query(l.search),
    protocol: l.protocol.replace(":", "")
  };

  function query(search) {
    var result = {};

    _.each(search.substr(1).split("&"), function (part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });

    return result;
  }
}

module.exports = LocationStateSource;