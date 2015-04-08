var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';
var _ = require('../../../../utils/mindash');

module.exports = {
  id: 'parseJSON',
  after: function (res) {
    if (isJson(res)) {
      return res.json().then(function (body) {
        try {
          res.body = body;
        } catch (e) {
          if (e instanceof TypeError) {
            // Workaround for Chrome 43+ where Response.body is not settable.
            Object.defineProperty(res, 'body', {value: body});
          } else {
            throw e;
          }
        }

        return res;
      });
    }

    return res;
  }
};

function isJson(res) {
  var contentTypes = res.headers.get(CONTENT_TYPE);

  if (!_.isArray(contentTypes)) {
    if (contentTypes === undefined || contentTypes === null) {
      contentTypes = [];
    } else {
      contentTypes = [contentTypes];
    }
  }

  return _.any(contentTypes, function (contentType) {
    return contentType.indexOf(JSON_CONTENT_TYPE) !== -1;
  });
}
