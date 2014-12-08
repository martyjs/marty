var MOCK_SERVER_PORT = 8956;
var _ = require('lodash-node');
var format = require('util').format;
var expect = require('chai').expect;
var HttpMixin = require('../lib/mixins/httpMixin');

describe('HttpMixin', function () {
  var API, baseUrl, response;

  beforeEach(function () {
    baseUrl = format('http://localhost:%s/stub/', MOCK_SERVER_PORT);
  });


  describe('when you dont specify a baseUrl', function () {
    var url;

    beforeEach(function () {
      url = baseUrl + 'foos';

      return HttpMixin.get(url).then(storeResponse);
    });

    it('should start a get request with the given url', function () {
      expect(response).to.eql({
        url: '/stub/foos',
        method: 'GET',
        body: {}
      });
    });
  });

  describe('#get()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('get', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        return makeRequest('get', {
          url: 'bars/baz',
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/bars/baz',
          method: 'GET',
          body: {}
        });
      });
    });
  });

  describe('#put()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('put', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'PUT',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      var expectedBody;

      beforeEach(function () {
        expectedBody = { foo: 'bar' };

        return makeRequest('put', {
          url: 'bars/baz',
          data: expectedBody
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          method: 'PUT',
          url: '/stub/bars/baz',
          body: expectedBody
        });
      });
    });
  });

  describe('#post()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('post', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'POST',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      var expectedBody;

      beforeEach(function () {
        expectedBody = { foo: 'bar' };

        return makeRequest('post', {
          url: 'bars/baz',
          data: expectedBody
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          method: 'POST',
          url: '/stub/bars/baz',
          body: expectedBody
        });
      });
    });
  });

  describe('#delete()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('delete', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'DELETE',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        return makeRequest('delete', {
          url: 'bars/baz',
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/bars/baz',
          method: 'DELETE',
          body: {}
        });
      });
    });
  });

  describe('#baseUrl', function () {
    describe('when you have a baseUrl', function () {
      beforeEach(function () {
        API = _.extend({
          baseUrl: baseUrl,
          getUser: function () {
            return this.get('/foos').then(storeResponse);
          }
        }, HttpMixin);

        return API.getUser();
      });

      it('should add the / if its missing', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });

    describe('when you dont specify a / in the baseUrl or url', function () {
      beforeEach(function () {
        API = _.extend({
          baseUrl: baseUrl.substring(0, baseUrl.length - 1),
          getUser: function () {
            return this.get('foos').then(storeResponse);
          }
        }, HttpMixin);

        return API.getUser();
      });

      it('should add the / if its missing', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });
  });

  function storeResponse(res) {
    response = res;
  }

  function makeRequest(method) {
    var args = _.rest(arguments);

    API = _.extend({
      baseUrl: baseUrl,
      execute: function () {
        return this[method].apply(this, args).then(storeResponse);
      }
    }, HttpMixin);

    return API.execute();
  }
});
