var sinon = require('sinon');
var _ = require('lodash-node');
var expect = require('chai').expect;
var HttpStateSource = require('../../../lib/stateSources/http');

require('es6-promise').polyfill();

describe('HttpStateSource', function () {

  this.timeout(10000);

  var API, baseUrl, response;
  var middleware1, middleware2, middleware3, executionOrder;

  beforeEach(function () {
    baseUrl = '/stub/';
  });

  describe('when you dont specify a baseUrl', function () {
    var url;

    beforeEach(function () {
      url = baseUrl + 'foos';

      return HttpStateSource().get(url).then(storeResponse);
    });

    it('should start a get request with the given url', function () {
      expect(response).to.eql({
        url: '/stub/foos',
        method: 'GET',
        body: {}
      });
    });
  });

  describe('middleware', function () {
    var server, expectedStateSource, actualContext;

    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.respondWith('GET', '/foo', [400, {}, '']);
    });

    afterEach(function () {
      server.restore();
    });

    describe('use', function () {
      describe('before', function () {
        beforeEach(function () {
          executionOrder = [];
          middleware1 = {
            priority: 2,
            before: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          middleware2 = {
            before: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          middleware3 = {
            priority: 1,
            before: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.use(middleware1);
          HttpStateSource.use(middleware2);
          HttpStateSource.use(middleware3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.remove(middleware1);
          HttpStateSource.remove(middleware2);
          HttpStateSource.remove(middleware3);
        });

        it('should call the before middleware once', function () {
          _.each([middleware1, middleware2, middleware3], function (middleware) {
            expect(middleware.before).to.be.calledOnce;
          });
        });

        it('should set the context to the mixin', function () {
          expect(actualContext).to.equal(expectedStateSource);
        });

        it('should execute them in priority order', function () {
          expect(executionOrder).to.eql([3, 1, 2]);
        });
      });

      describe('after', function () {
        beforeEach(function () {
          executionOrder = [];
          middleware1 = {
            priority: 2,
            after: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          middleware2 = {
            after: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          middleware3 = {
            priority: 1,
            after: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.use(middleware1);
          HttpStateSource.use(middleware2);
          HttpStateSource.use(middleware3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.remove(middleware1);
          HttpStateSource.remove(middleware2);
          HttpStateSource.remove(middleware3);
        });

        it('should call the after middleware once', function () {
          _.each([middleware1, middleware2, middleware3], function (middleware) {
            expect(middleware.after).to.be.calledOnce;
          });
        });

        it('should set the context to the mixin', function () {
          expect(actualContext).to.equal(expectedStateSource);
        });

        it('should execute them in priority order', function () {
          expect(executionOrder).to.eql([3, 1, 2]);
        });
      });
    });

    function get() {
      expectedStateSource = new HttpStateSource();

      var res = expectedStateSource.get('/foo');

      server.respond();

      return res;
    }
  });

  describe('when a request fails', function () {
    var server, expectedResponse, actualError;

    beforeEach(function () {
      server = sinon.fakeServer.create();

      server.respondWith('GET', '/foo', [400, {}, '']);

      var res = new HttpStateSource().get('/foo');

      server.respond();

      return res.catch(function (error) {
        actualError = error;
      });
    });

    afterEach(function () {
      server.restore();
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
        API = HttpStateSource({
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
        API = HttpStateSource({
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

    API = HttpStateSource({
      baseUrl: baseUrl
    });

    return API[method].apply(API, args).then(storeResponse);
  }
});
