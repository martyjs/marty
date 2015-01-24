function ActionPredicateUndefinedError(actionHandler, store) {
  this.name = 'Action predicate undefined';
  this.message = 'The action predicate for "' + actionHandler + '" was undefined';

  if (store && store.displayName) {
    this.message += ' in the ' + store.displayName + ' store';
  }
}

ActionPredicateUndefinedError.prototype = Error.prototype;

module.exports = ActionPredicateUndefinedError;
