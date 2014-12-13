var expect = require('chai').expect;
var getHtml = require('./lib/getHtml');

describe('Isomorphism', function () {
  var statusCode, $;

  describe('when you request an unknown route', function () {
    beforeEach(function () {
      return get('dontknow');
    });

    it('should return a 404', function () {
      expect(statusCode).to.equal(404);
    });
  });

  describe('when you request a known route', function () {
    beforeEach(function () {
      return get('hello-world');
    });

    it('should return a 200', function () {
      expect(statusCode).to.equal(200);
    });

    it('should return the html', function () {
      expect($('#message').text()).to.equal('hello world');
    });
  });

  function get(url) {
    return getHtml('iso/' + url).then(function (res) {
      $ = res.$;
      statusCode = res.statusCode;
    }).catch(function (err) {
      console.error(err);
    });
  }
});