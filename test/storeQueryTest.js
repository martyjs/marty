var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var StoreQuery = require('../lib/storeQuery');
var NotFoundError = require('../lib/errors/notFound');

describe('StoreQuery', function () {
  var query, expectedContext, actualContext, expectedResult, expectedError;

  beforeEach(function () {
    expectedContext = { store: 1 };
  });

  describe('#when()', function () {
    var actualResult, expectedResult;

    describe('when the query is pending', function () {
      describe('when there is a pending callback', function () {
        beforeEach(function (done) {
          expectedResult = 10;
          withPendingQuery(function (query) {
            actualResult = query.when({
              pending: function () {
                return expectedResult;
              }
            });
          }, done);
        });

        it('should execute the pending callback', function () {
          expect(actualResult).to.equal(expectedResult);
        });
      });

      describe('when there is NOT a pending callback', function () {
        it('should throw an error', function (done) {
          withPendingQuery(function (query) {
            expect(function () { query.when(); }).throw(Error);
          }, done);
        });
      });

      function withPendingQuery(cb, done) {
        var query = new StoreQuery(null, noop, function () {
          return new Promise(function (resolve) {
            setTimeout(function () {
              cb(query);
              resolve();
              done();
            }, 1);
          });
        });
      }
    });

    describe('when the query has failed', function () {
      var expectedError, actualError;

      beforeEach(function () {
        expectedError = new Error();
        query = new StoreQuery(null, function () {
          throw expectedError;
        });
      });

      describe('when there is a failed callback', function () {
        beforeEach(function () {
          expectedResult = 10;
          actualResult = query.when({
            failed: function (error) {
              actualError = error;
              return expectedResult;
            }
          });
        });

        it('should execute the failed callback', function () {
          expect(actualResult).to.equal(expectedResult);
        });

        it('should pass in the error', function () {
          expect(actualError).to.equal(expectedError);
        });
      });

      describe('when there is NOT a failed callback', function () {
        it('should throw an error', function () {
          expect(function () { query.when(); }).throw(Error);
        });
      });
    });

    describe('when the query is done', function () {
      var expectedQueryResult, actualQueryResult;

      beforeEach(function () {
        expectedQueryResult = { foo: 1 };
        query = new StoreQuery(null, function () {
          return expectedQueryResult;
        });
      });

      describe('when there is a done callback', function () {
        beforeEach(function () {
          expectedResult = 10;
          actualResult = query.when({
            done: function (queryResult) {
              actualQueryResult = queryResult;
              return expectedResult;
            }
          });
        });

        it('should execute the done callback', function () {
          expect(actualResult).to.equal(expectedResult);
        });

        it('should pass in the query result', function () {
          expect(actualQueryResult).to.equal(expectedQueryResult);
        });
      });

      describe('when there is NOT a done callback', function () {
        it('should throw an error', function () {
          expect(function () { query.when(); }).throw(Error);
        });
      });
    });
  });

  describe('when the local query returns a value', function () {
    beforeEach(function () {
      expectedResult = {foo: 'bar'};

      query = new StoreQuery(expectedContext, function () {
        actualContext = this;
        return expectedResult;
      });
    });

    it('should have a status of done', function () {
      expect(query.status).to.equal('done');
    });

    it('should say it is done', function () {
      expect(query.done).to.be.true;
    });

    it('should have the result', function () {
      expect(query.result).to.equal(expectedResult);
    });

    it('should set the context to the store', function () {
      expect(actualContext).to.equal(expectedContext);
    });
  });

  describe('when the local query throws an exception', function () {
    beforeEach(function () {
      expectedError = new Error();

      query = new StoreQuery(expectedContext, function () {
        throw expectedError;
      });
    });

    it('should have a status of failed', function () {
      expect(query.status).to.equal('failed');
    });

    it('should say its failed', function () {
      expect(query.failed).to.be.true;
    });

    it('should have the result', function () {
      expect(query.error).to.equal(expectedError);
    });
  });

  describe('when the local query does not return a value', function () {
    describe('when the remote query returns null', function () {
      beforeEach(function () {
        query = new StoreQuery(expectedContext, noop, noop);
      });

      it('should have a status of failed', function () {
        expect(query.status).to.equal('failed');
      });

      it('should say its failed', function () {
        expect(query.failed).to.be.true;
      });

      it('should have the result', function () {
        expect(query.error).to.be.instanceof(NotFoundError);
      });
    });

    describe('when the remote query returns a value', function () {
      beforeEach(function () {
        expectedResult = {foo: 'bar'};

        query = new StoreQuery(expectedContext, noop, function () {
          actualContext = this;
          return expectedResult;
        });
      });

      it('should have a status of done', function () {
        expect(query.status).to.equal('done');
      });

      it('should say it is done', function () {
        expect(query.done).to.be.true;
      });

      it('should have the result', function () {
        expect(query.result).to.equal(expectedResult);
      });

      it('should set the context to the store', function () {
        expect(actualContext).to.equal(expectedContext);
      });
    });

    describe('when the remote query throws an exception', function () {
      beforeEach(function () {
        expectedError = new Error();

        query = new StoreQuery(expectedContext, noop, function () {
          throw expectedError;
        });
      });

      it('should have a status of failed', function () {
        expect(query.status).to.equal('failed');
      });

      it('should say its failed', function () {
        expect(query.failed).to.be.true;
      });

      it('should have the error', function () {
        expect(query.error).to.equal(expectedError);
      });
    });

    describe('when the remote query returns a promise', function () {
      describe('when the promise fails', function () {
        beforeEach(function (done) {
          expectedError = new Error();

          query = new StoreQuery(expectedContext, noop, function () {
            return new Promise(function (resolve, reject) {
              reject(expectedError);
            });
          });

          setTimeout(done, 1);
        });

        it('should have a status of failed', function () {
          expect(query.status).to.equal('failed');
        });

        it('should say its failed', function () {
          expect(query.failed).to.be.true;
        });

        it('should have the error', function () {
          expect(query.error).to.equal(expectedError);
        });
      });

      describe('when the promise completes done', function () {
        describe('when the local query then returns a value', function () {
          var localResult;

          beforeEach(function (done) {
            localResult = null;
            expectedResult = { foo: 'bar' };

            query = new StoreQuery(expectedContext, function () {
              return localResult;
            }, function () {
              return new Promise(function (resolve) {
                localResult = expectedResult;
                resolve();
              });
            });

            setTimeout(done, 1);
          });

          it('should have a status of done', function () {
            expect(query.status).to.equal('done');
          });

          it('should say it is done', function () {
            expect(query.done).to.be.true;
          });

          it('should have the result', function () {
            expect(query.result).to.equal(expectedResult);
          });
        });

        describe('when the local query then does not return a value', function () {
          beforeEach(function (done) {
            query = new StoreQuery(expectedContext, noop, function () {
              return new Promise(function (resolve) {
                resolve();
              });
            });

            setTimeout(done, 1);
          });

          it('should have a status of failed', function () {
            expect(query.status).to.equal('failed');
          });

          it('should say its failed', function () {
            expect(query.failed).to.be.true;
          });

          it('should have the error', function () {
            expect(query.error).to.be.instanceof(NotFoundError);
          });
        });
      });
    });
  });

  function noop() {
  }
});