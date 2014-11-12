var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var DataFlow = require('../lib/diagnostics/dataFlow');

describe.only('DataFlow', function () {
  var flow;

  beforeEach(function () {
    flow = new DataFlow();
  });

  describe('#startFunctionCall()', function () {
    var expectedFunctionCall, actualFunctionCall;
    beforeEach(function () {
      expectedFunctionCall = {
        name: 'foo',
        arguments: ['a'],
        context: { type: 'Foo', id: '1' }
      };

      actualFunctionCall = flow.startFunctionCall(expectedFunctionCall);
    });

    it('should return a function call', function () {
      expect(actualFunctionCall).to.be.defined;
    });

    it('should set the function call id', function () {
      expect(actualFunctionCall.id).to.be.defined;
    });

    it('should set the function calls name', function () {
      expect(actualFunctionCall.name).to.equal(actualFunctionCall.name);
    });

    it('should set the function calls arguments', function () {
      expect(actualFunctionCall.arguments).to.equal(actualFunctionCall.arguments);
    });

    it('should set the function calls context', function () {
      expect(actualFunctionCall.context).to.equal(actualFunctionCall.context);
    });

    it('should set the function calls children to an empty array', function () {
      expect(actualFunctionCall.children).to.eql([]);
    });
  });

  describe('multiple levels', function () {
    var id = 1, foo = {};
    var FooHttpAPI = {
      getFoos: function (id) {
        var func = flow.startFunctionCall({
          name: 'getFoos',
          arguments: arguments,
          context: { type: 'HttpAPI', id: 'FooHttpAPI' }
        });

        Http.get('/foos/' + id, function (foo) {
          FooActionCreator.addFoo(foo);
        });

        Http.post('/foos', function (foo) {
          FooActionCreator.receiveFoo(foo);
        });

        flow.endFunctionCall();
      }
    };

    var Http = {
      get: function (url, cb) {
        var func = flow.startFunctionCall({
          name: 'get',
          arguments: [],
          context: { type: 'Http', id: 'Http' }
        });

        flow.startAsyncOperation();

        setTimeout(function () {
          flow.endAsyncOperation(func);
          cb(foo);
          flow.endFunctionCall(null);
        }, 1);
      },
      post: function (url, cb) {
        var func = flow.startFunctionCall({
          name: 'post',
          arguments: [],
          context: { type: 'Http', id: 'Http' }
        });

        flow.startAsyncOperation();
        setTimeout(function () {
          flow.endAsyncOperation(func);
          cb(foo);
          flow.endFunctionCall(null);
        }, 1);
      }
    };

    var FooActionCreator = {
      addFoo: function (foo) {
        var func = flow.startFunctionCall({
          name: 'addFoo',
          arguments: arguments,
          context: { type: 'ActionCreator', id: 'FooActionCreator' }
        });

        flow.endFunctionCall(foo);
      },
      receiveFoo: function (foo) {
        var func = flow.startFunctionCall({
          name: 'receiveFoo',
          arguments: arguments,
          context: { type: 'ActionCreator', id: 'FooActionCreator' }
        });

        flow.endFunctionCall(foo);
      }
    };

    beforeEach(function (done) {
      FooHttpAPI.getFoos(id);
      setTimeout(done, 10);
    });

    it('should trace all function calls', function () {
      expect(flow.toJSON()).to.eql({
        name: 'getFoos',
        arguments: [id],
        context: { type: 'HttpAPI', id: 'FooHttpAPI' },
        returnValue: null,
        complete: true,
        children: [{
          name: 'get',
          arguments: [],
          context: { type: 'Http', id: 'Http' },
          returnValue: null,
          complete: true,
          children: [{
            name: 'addFoo',
            arguments: [foo],
            context: { type: 'ActionCreator', id: 'FooActionCreator' },
            returnValue: foo,
            complete: true,
            children: []
          }]
        }, {
          name: 'post',
          arguments: [],
          context: { type: 'Http', id: 'Http' },
          returnValue: null,
          complete: true,
          children: [{
            name: 'receiveFoo',
            arguments: [foo],
            context: { type: 'ActionCreator', id: 'FooActionCreator' },
            returnValue: foo,
            complete: true,
            children: []
          }]
        }]
      })
    });
  });
});
