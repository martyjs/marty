var MOCK_SERVER_PORT = 8956;
var sinon = require('sinon');
var _ = require('lodash-node');
var format = require('util').format;
var expect = require('chai').expect;
var HttpAPI = require('../lib/repositories/httpAPI');

require('es6-promise').polyfill();

describe('HttpAPIRepository', function () {

  this.timeout(10000);

  var API, baseUrl, response;

  beforeEach(function () {
    baseUrl = format('http://localhost:%s/stub/', MOCK_SERVER_PORT);
  });

  describe('when you dont specify a baseUrl', function () {
    var url;

    beforeEach(function () {
      url = baseUrl + 'foos';

      return HttpAPI().get(url).then(storeResponse);
    });

    it('should start a get request with the given url', function () {
      expect(response).to.eql({
        url: '/stub/foos',
        method: 'GET',
        body: {}
      });
    });
  });

  describe('when a request fails', function () {
    var fetch, expectedResponse, actualError;
    beforeEach(function () {
      expectedResponse = {
        status: 400
      };

      var fetchResult =  new Promise(function (resolve) {
        resolve(expectedResponse);
      });

      fetch = sinon.stub(window, 'fetch').returns(fetchResult);

      return new HttpAPI().get('/foo').catch(function (error) {
        actualError = error;
      });
    });

    afterEach(function () {
      fetch.restore();
    });

    it('should reject with the response object', function () {
      expect(actualError).to.eql(expectedResponse);
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
          body: expectedBody
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
          body: expectedBody
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
        API = HttpAPI({
          baseUrl: baseUrl
        });

        return API.get('/foos').then(storeResponse);
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
        API = HttpAPI({
          baseUrl: baseUrl.substring(0, baseUrl.length - 1)
        });

        return API.get('foos').then(storeResponse);
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
    response = res.body;
  }

  function makeRequest(method) {
    var args = _.rest(arguments);

    API = HttpAPI({
      baseUrl: baseUrl
    });

    return API[method].apply(API, args).then(storeResponse);
  }
});
