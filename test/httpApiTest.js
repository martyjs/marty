var sinon = require('sinon');
var _ = require('lodash-node');
var http = require('../lib/http');
var expect = require('chai').expect;
var HttpAPI = require('../lib/httpAPI');

describe('HttpAPI', function () {
  var request, API, baseUrl, headers;

  beforeEach(function () {
    baseUrl = 'http://foos.com/';
    request = sinon.stub(http, 'request');
  });

  afterEach(function () {
    request.restore();
  });

  describe('#mixins', function () {
    it('should allow you to mixin object literals');
  });

  describe('when you dont specify a baseUrl', function () {
    var url = 'http://foos.com/foos';

    beforeEach(function () {
      API = new HttpAPI({
        getFoos: function () {
          return this.get(url);
        }
      });
      API.getFoos();
    });

    it('should start a get request with the given url', function () {
      expect(request).to.have.been.calledWith({
        url: url,
        method: 'GET'
      });
    });
  });

  describe('#get()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('get', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'GET'
        });
      });
    });

    describe('when you pass in a url and some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('get', '/foos', {
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'GET',
          headers: headers
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('get', {
          url: 'foos',
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'GET',
          headers: headers
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
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'PUT'
        });
      });
    });

    describe('when you pass in a url and some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('put', '/foos', {
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'PUT',
          headers: headers
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('put', {
          url: 'foos',
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'PUT',
          headers: headers
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
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'POST'
        });
      });
    });

    describe('when you pass in a url and some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('post', '/foos', {
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'POST',
          headers: headers
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('post', {
          url: 'foos',
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'POST',
          headers: headers
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
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'DELETE'
        });
      });
    });

    describe('when you pass in a url and some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('delete', '/foos', {
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'DELETE',
          headers: headers
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        headers = { foo: 'bar' };
        return makeRequest('delete', {
          url: 'foos',
          headers: headers
        });
      });

      it('should create some options which include the url', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'DELETE',
          headers: headers
        });
      });
    });
  });

  describe('#baseUrl', function () {
    describe('when you have a baseUrl', function () {
      beforeEach(function () {
        API = new HttpAPI({
          baseUrl: baseUrl,
          getUser: function () {
            return this.get('/foos');
          }
        });

        API.getUser();
      });

      it('should add the / if its missing', function () {
        expect(request).to.have.been.calledWith({
          url: baseUrl + 'foos',
          method: 'GET'
        });
      });
    });

    describe('when you dont specify a / in the baseUrl or url', function () {
      beforeEach(function () {
        API = new HttpAPI({
          baseUrl: 'http://foos.com',
          getUser: function () {
            return this.get('foos');
          }
        });

        API.getUser();
      });

      it('should add the / if its missing', function () {
        expect(request).to.have.been.calledWith({
          url: 'http://foos.com/foos',
          method: 'GET'
        });
      });
    });
  });

  function makeRequest(method) {
    var args = _.rest(arguments);

    API = new HttpAPI({
      baseUrl: baseUrl,
      execute: function () {
        return this[method].apply(this, args);
      }
    });

    return API.execute();
  }
});
