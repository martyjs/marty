"use strict";

if (typeof window !== "undefined" && window.React) {
  module.exports = window.React;
} else {
  module.exports = require("react");
}