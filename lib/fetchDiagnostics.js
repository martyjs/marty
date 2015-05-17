var _ = require('./utils/mindash');

class FetchDiagnostics {
  constructor(prevDiagnostics) {
    prevDiagnostics = prevDiagnostics || {
      fetches: [],
      numberOfPendingFetches: 0
    };

    this.numberOfNewFetchesMade = 0;
    this.fetches = prevDiagnostics.fetches;
    this.numberOfPendingFetches = prevDiagnostics.numberOfPendingFetches;
  }

  fetchStarted(storeId, fetchId) {
    var fetch = this.getFetch(storeId, fetchId);

    if (!fetch) {
      this.numberOfNewFetchesMade++;
    }

    this.numberOfPendingFetches++;
    this.fetches.push({
      status: 'PENDING',
      storeId: storeId,
      fetchId: fetchId,
      startTime: new Date()
    });
  }

  getFetch(storeId, fetchId) {
    return _.find(this.fetches, {
      storeId: storeId,
      fetchId: fetchId
    });
  }

  fetchDone(storeId, fetchId, status, options) {
    var fetch = this.getFetch(storeId, fetchId);

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