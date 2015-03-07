var DispatchCoordinator = require('../dispatchCoordinator');

class ActionCreators extends DispatchCoordinator {
  constructor(options) {
    super('ActionCreators', options);
  }
}

module.exports = ActionCreators;