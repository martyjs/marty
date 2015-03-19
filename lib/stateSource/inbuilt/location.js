var _ = require('../../utils/mindash');
var StateSource = require('../stateSource');
var locationFactory = defaultLocationFactory;

class LocationStateSource extends StateSource {
  constructor(options) {
    super(options);
    this._isLocationStateSource = true;
  }

  getLocation(location) {
    return locationFactory(this.context, location);
  }

  static setLocationFactory(value) {
    locationFactory = value;
  }
}

function defaultLocationFactory(context, location) {
  var l = location || window.location;

  return {
    url: l.url,
    path: l.pathname,
    hostname: l.hostname,
    query: query(l.search),
    protocol: l.protocol.replace(':', '')
  };

  function query(search) {
    var result = {};

    _.each(search.substr(1).split('&'), function (part) {
      var item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    return result;
  }
}

module.exports = LocationStateSource;