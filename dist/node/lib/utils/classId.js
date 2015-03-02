"use strict";

var uuid = require("./uuid");
var log = require("../logger");
var warnings = require("../warnings");

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  var displayName = "";

  if (clazz.displayName) {
    displayName = " '" + clazz.displayName + "'";
  }

  if (warnings.classDoesNotHaveAnId) {
    log.warn("Warning: The " + type + " " + displayName + " does not have an Id");
  }

  return clazz.displayName || uuid.generate();
}

module.exports = classId;