var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var Dispatcher = require('flux').Dispatcher;
var Promise = require('es6-promise').Promise;
var constants = require('../../lib/constants');
var autoDispatch = require('../../autoDispatch');
var stubbedLogger = require('../lib/stubbedLogger');
var MockDispatcher = require('./lib/mockDispatcher');
var describeStyles = require('./../lib/describeStyles');
var serializeError = require('../../lib/utils/serializeError');

describe('Queries', function () {
  var queries, dispatcher, actualResult, actualError, Marty;
  var expectedQueryType, expectedOtherArg, expectedArg;
  var actualQuery, payload, expectedError, promise, logger;

  beforeEach(function () {
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
    Marty = require('../../marty').createInstance();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when you create a query called \'dispatch\'', function () {
    it('should throw an error', function () {
      expect(createADispatchQueries).to.throw(Error);

      function createADispatchQueries() {
        var TestConstants = constants(['DISPATCH']);

        return Marty.createQueries({
          dispatcher: dispatcher,
          dispatch: TestConstants.DISPATCH()
        });
      }
    });
  });

  describe('resolve', function () {
    var context, queries, actualInstance, expectedInstance, query;

    beforeEach(function () {
      query = sinon.spy();
      queries = Marty.createQueries({
        id: 'foo',
        displayName: 'Bar',
        someQuery: query
      });

      context = Marty.createContext();
      actualInstance = queries.for(context);
      expectedInstance = context.instances.Queries.foo;
    });

    it('should resolve to the actual instance', function () {
      expect(actualInstance).to.equal(expectedInstance);
    });

    it('should still expose all querys', function () {
      queries.someQuery(1);
      expect(query).to.be.calledWith(1);
    });
  });

  describeStyles('when you create a query', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedQueryType = 'SOME_ACTION';
      queries = styles({
        classic: function () {
          return Marty.createQueries({
            dispatcher: dispatcher,
            someQuery: function (arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          });
        },
        es6: function () {
          class TestQueries extends Marty.Queries {
            someQuery(arg) {
              this.dispatch(expectedQueryType, expectedOtherArg, arg);
            }
          }

          return new TestQueries({
            dispatcher: dispatcher
          });
        }
      });

      actualResult = queries.someQuery(expectedArg);
    });

    it('should not return anything', function () {
      expect(actualResult).to.not.be.defined;
    });

    describe('#dispatch()', function () {
      beforeEach(function () {
        actualQuery = dispatcher.getActionWithType(expectedQueryType);
      });

      it('should dispatch the query with the given query type', function () {
        expect(actualQuery).to.exist;
      });

      it('should dispatch the query with the given arguments', function () {
        expect(actualQuery.arguments).to.eql([expectedOtherArg, expectedArg]);
      });
    });
  });

  describe('#mixins', function () {
    var mixin1, mixin2;

    beforeEach(function () {
      mixin1 = {
        foo: function () { return 'bar'; }
      };

      mixin2 = {
        bar: function () { return 'baz'; }
      };

      queries = Marty.createQueries({
        dispatcher: dispatcher,
        mixins: [mixin1, mixin2]
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(queries.foo()).to.equal('bar');
      expect(queries.bar()).to.equal('baz');
    });
  });
});
