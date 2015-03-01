"use strict";

function ActionHandlerNotFoundError(actionHandler, store) {
  this.name = "Action handler not found";
  this.message = "The action handler \"" + actionHandler + "\" could not be found";

  if (store) {
    var displayName = store.displayName || store.id;
    this.message += " in the " + displayName + " store";
  }
}

ActionHandlerNotFoundError.prototype = Error.prototype;

module.exports = ActionHandlerNotFoundError;