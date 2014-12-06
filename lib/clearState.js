var _ = require('./utils/tinydash');

function clearState() {
  _.each(this.getStores(), function (store) {
    store.clear();
  });
}

module.exports = clearState;