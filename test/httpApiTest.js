var expect = require('chai').expect;
var HttpAPI = require('../lib/httpAPI');

describe('HttpAPI', function () {
  var api;

  beforeEach(function () {
    api = new HttpAPI({
      baseUrl: 'http://localhost:9876/base/test/fixtures',
      getUser: function () {
        return this.get('/user.json');
      }
    });
  });

  describe('#baseUrl', function () {
    describe('when the url ends with a / and the path begins with a /');
  });

  describe('#get()', function () {
    it('should be able to get a resource', function (done) {
      api.getUser().end(function (res) {
        expect(res.ok).to.be.true;
        expect(res.body.name).to.equal('foo');
        done();
      });
    });
  });
});
