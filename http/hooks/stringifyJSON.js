var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';
var _ = require('../../lib/utils/mindash');

module.exports = {
  id: 'stringifyJSON',
  before: function (req) {
    var contentType = req.headers[CONTENT_TYPE] || JSON_CONTENT_TYPE;

    if (typeof FormData !== 'undefined' && req.body instanceof FormData) {
      return;
    }

    if (contentType === JSON_CONTENT_TYPE && _.isObject(req.body)) {
      req.body = JSON.stringify(req.body);
      req.headers[CONTENT_TYPE] = JSON_CONTENT_TYPE;
    }
  }
};