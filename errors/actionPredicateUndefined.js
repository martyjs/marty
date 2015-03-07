function ActionPredicateUndefinedError(actionHandler, store) {
  this.name = 'Action predicate undefined';
  this.message = 'The action predicate for "' + actionHandler + '" was undefined';

  if (store) {
    var displayName = store.displayName || store.id;
    this.message += ' in the ' + displayName + ' store';
  }
}

ActionPredicateUndefinedError.prototype = Error.prototype;

module.exports = ActionPredicateUndefinedError;
