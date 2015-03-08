var _ = require('./utils/mindash');

class FetchDiagnostics {
  constructor() {
    this.numberOfPendingFetches = 0;
    this.fetches = [];
  }

  fetchStarted(storeId, fetchId) {
    this.numberOfPendingFetches++;
    this.fetches.push({
      status: 'PENDING',
      storeId: storeId,
      fetchId: fetchId,
      startTime: new Date()
    });
  }

  fetchDone(storeId, fetchId, status, options) {
    var fetch  = _.find(this.fetches, {
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

  get hasPendingFetches () {
    return this.numberOfPendingFetches > 0;
  }

  toJSON() {
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

module.exports = FetchDiagnostics;