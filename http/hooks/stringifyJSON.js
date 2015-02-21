var _ = require('underscore');
var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';

module.exports = {
  before: function (req) {
    var contentType = req.headers[CONTENT_TYPE] || JSON_CONTENT_TYPE

    if (typeof FormData !== 'undefined' && req.body instanceof FormData) {
      return;
    }

    if (contentType === JSON_CONTENT_TYPE && _.isObject(req.body)) {
      req.body = JSON.stringify(req.body);
      req.headers[CONTENT_TYPE] = JSON_CONTENT_TYPE;
    }
  }
};