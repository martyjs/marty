var DispatchCoordinator = require('../dispatchCoordinator');

class Queries extends DispatchCoordinator {
  constructor(options) {
    super('Queries', options);
  }
}

module.exports = Queries;