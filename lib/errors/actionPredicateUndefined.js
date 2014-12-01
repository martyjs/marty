function ActionPredicateUndefinedError(actionHandler, store) {
  this.name = 'Action predicate undefined';
  this.message = 'The action predicate for "' + actionHandler + '" was undefined';

  if (store && store.name) {
    this.message += ' in the ' + store.name + ' store';
  }
}

ActionPredicateUndefinedError.prototype = Error.prototype;

module.exports = ActionPredicateUndefinedError;