"use strict";

module.exports = {
  id: "includeCredentials",
  before: function before(req) {
    // Enable sending Cookies for authentication.
    // Ref: https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    req.credentials = "same-origin";
  }
};