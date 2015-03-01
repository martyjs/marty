var sinon = require('sinon');
var _ = require('lodash-node');
var expect = require('chai').expect;
var Marty = require('../../../index');
var warnings = require('../../../warnings');
var HttpStateSource = require('../../../stateSources/http');
var describeStyles = require('../../lib/describeStyles');

require('es6-promise').polyfill();

describeStyles('HttpStateSource', function (styles) {
  this.timeout(10000);

  var API, baseUrl, response;
  var hook1, hook2, hook3, executionOrder;

  beforeEach(function () {
    baseUrl = '/stub/';
    warnings.classDoesNotHaveAnId = false;
  });

  afterEach(function () {
    warnings.classDoesNotHaveAnId = true;
  });

  describe('when you dont specify a baseUrl', function () {
    var url;

    beforeEach(function () {
      url = baseUrl + 'foos';

      return httpStateSource().get(url).then(storeResponse);
    });

    it('should start a get request with the given url', function () {
      expect(response).to.eql({
        url: '/stub/foos',
        method: 'GET',
        body: {}
      });
    });
  });

  describe('hooks', function () {
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
          hook1 = {
            priority: 2,
            before: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          hook2 = {
            before: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          hook3 = {
            priority: 1,
            before: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.addHook(hook1);
          HttpStateSource.addHook(hook2);
          HttpStateSource.addHook(hook3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.removeHook(hook1);
          HttpStateSource.removeHook(hook2);
          HttpStateSource.removeHook(hook3);
        });

        it('should call the before hook once', function () {
          _.each([hook1, hook2, hook3], function (hook) {
            expect(hook.before).to.be.calledOnce;
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
          hook1 = {
            priority: 2,
            after: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          hook2 = {
            after: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          hook3 = {
            priority: 1,
            after: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.addHook(hook1);
          HttpStateSource.addHook(hook2);
          HttpStateSource.addHook(hook3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.removeHook(hook1);
          HttpStateSource.removeHook(hook2);
          HttpStateSource.removeHook(hook3);
        });

        it('should call the after hook once', function () {
          _.each([hook1, hook2, hook3], function (hook) {
            expect(hook.after).to.be.calledOnce;
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
      expectedStateSource = httpStateSource();

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

      var res = httpStateSource().get('/foo');

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

    if (typeof FormData !== 'undefined') {
      describe('when request body is a FormData object', function () {
        var options;

        beforeEach(function () {
          baseUrl = baseUrl.substring(0, baseUrl.length - 1);
          API = httpStateSource(baseUrl);

          options = {
            url: 'foos',
            headers: {},
            body: new FormData()
          };

          return API.post(options);
        });

        it('should not set the Content-Type request header', function () {
          expect(options.headers['Content-Type']).to.eql(undefined);
        });
      });

      describe('when request body is not a FormData object', function () {
        var options;

        beforeEach(function () {
          baseUrl = baseUrl.substring(0, baseUrl.length - 1);

          API = httpStateSource(baseUrl);

          options = {
            url: 'foos',
            headers: {},
            body: {}
          };

          return API.post(options);
        });

        it('should default the Content-Type request header to application/json', function () {
          expect(options.headers['Content-Type']).to.eql('application/json');
        });
      });
    }
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
        API = httpStateSource(baseUrl);

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
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);

        API = httpStateSource(baseUrl);

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

  function httpStateSource(baseUrl) {
    return styles({
      classic: function () {
        return Marty.createStateSource({
          type: 'http',
          baseUrl: baseUrl
        });
      },
      es6: function () {
        class ExampleHttpStateSource extends HttpStateSource {
          constructor() {
            this.baseUrl = baseUrl;
          }
        }

        return new ExampleHttpStateSource();
      }
    });
  }

  function storeResponse(res) {
    response = res.body;
  }

  function makeRequest(method) {
    var args = _.rest(arguments);

    API = httpStateSource(baseUrl);

    return API[method].apply(API, args).then(storeResponse);
  }
});