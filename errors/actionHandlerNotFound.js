function ActionHandlerNotFoundError(actionHandler, store) {
  this.name = 'Action handler not found';
  this.message = 'The action handler "' + actionHandler + '" could not be found';

  if (store && store.displayName) {
    this.message += ' in the ' + store.displayName + ' store';
  }
}

ActionHandlerNotFoundError.prototype = Error.prototype;

module.exports = ActionHandlerNotFoundError;
