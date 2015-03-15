"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("./utils/mindash");

var FetchDiagnostics = (function () {
  function FetchDiagnostics() {
    _classCallCheck(this, FetchDiagnostics);

    this.numberOfPendingFetches = 0;
    this.fetches = [];
  }

  _createClass(FetchDiagnostics, {
    fetchStarted: {
      value: function fetchStarted(storeId, fetchId) {
        this.numberOfPendingFetches++;
        this.fetches.push({
          status: "PENDING",
          storeId: storeId,
          fetchId: fetchId,
          startTime: new Date()
        });
      }
    },
    fetchDone: {
      value: function fetchDone(storeId, fetchId, status, options) {
        var fetch = _.find(this.fetches, {
          storeId: storeId,
          fetchId: fetchId
        });

        if (fetch) {
          _.extend(fetch, {
            status: status,
            time: new Date() - fetch.startTime
          }, options);

          this.numberOfPendingFetches--;
        }
      }
    },
    hasPendingFetches: {
      get: function () {
        return this.numberOfPendingFetches > 0;
      }
    },
    toJSON: {
      value: function toJSON() {
        return _.map(this.fetches, fetchWithTime);

        function fetchWithTime(fetch) {
          if (_.isUndefined(fetch.time)) {
            fetch.time = new Date() - fetch.startTime;
          }

          delete fetch.startTime;

          return fetch;
        }
      }
    }
  });

  return FetchDiagnostics;
})();

module.exports = FetchDiagnostics;