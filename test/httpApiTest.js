var expect = require('chai').expect;
var HttpAPI = require('../lib/httpAPI');

describe('HttpAPI', function () {
  var api, username = 'jhollingworth';

  beforeEach(function () {
    api = new HttpAPI({
      baseUrl: 'https://api.github.com',
      getUser: function (username) {
        return this.get('/users/' + username);
      }
    });
  });

  describe('#get()', function () {
    it('should be able to get a resource', function (done) {
      api.getUser(username).end(function (res) {
        expect(res.ok).to.be.true;
        expect(res.body.login).to.equal(username);
        done();
      });
    });
  });
});
