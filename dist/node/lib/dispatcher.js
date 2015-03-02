"use strict";

var uuid = require("./utils/uuid");
var Dispatcher = require("flux").Dispatcher;
var defaultDispatcher = createDefaultDispatcher();

createDispatcher.getDefault = function () {
  return defaultDispatcher;
};

createDispatcher.dispose = function () {
  defaultDispatcher = createDefaultDispatcher();
};

module.exports = createDispatcher;

function createDefaultDispatcher() {
  var defaultDispatcher = createDispatcher();
  defaultDispatcher.isDefault = true;
  return defaultDispatcher;
}

function createDispatcher() {
  var dispatcher = new Dispatcher();
  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  return dispatcher;
}