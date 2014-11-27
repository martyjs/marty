function ActionHandlerNotFoundError(actionHandler, store) {
  this.name = 'Action handler not found';
  this.message = 'The action handler "' + actionHandler + '" could not be found';

  if (store && store.name) {
    this.message += ' in the ' + store.name + ' store';
  }
}

ActionHandlerNotFoundError.prototype = Error.prototype;

module.exports = ActionHandlerNotFoundError;