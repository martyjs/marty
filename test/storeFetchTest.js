var sinon = require('sinon');
var Marty = require('../index');
var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

describe('Store#fetch()', function () {
  var listener, store, changeListener, endFetch, remoteFetch, fetchId;
  var expectedResult, actualResult, actualContext, expectedError, actualError;

  beforeEach(function () {
    fetchId = 'foo';
    listener = sinon.spy();
    store = Marty.createStore();
    changeListener = store.addChangeListener(listener);
  });

  afterEach(function () {
    store.dispose();
    endFetch && endFetch();
    changeListener.dispose();
  });

  describe('when you pass in an object literal', function () {
    var locally;

    describe('#locally()', function () {
      beforeEach(function () {
        locally = sinon.spy();
        store.fetch({ id: 'foo', locally: locally });
      });

      it('should call the locally function', function () {
        expect(locally).to.have.been.calledOnce;
      });
    });

    describe('#remotely()', function () {
      var remotely;

      beforeEach(function () {
        remotely = sinon.spy();
        store.fetch({
          id: 'foo',
          locally: noop,
          remotely: remotely
        });
      });

      it('should call the remotely function', function () {
        expect(remotely).to.have.been.calledOnce;
      });
    });

    describe('#dependsOn', function () {
      describe('when you pass it a fetch result', function () {
        describe('when the fetch result is pending', function () {
          beforeEach(function () {
            locally = sinon.spy();
            actualResult = store.fetch({
              id: 'foo',
              locally: locally,
              dependsOn: store.fetch.pending()
            });
          });

          it('should return a pending result', function () {
            expect(actualResult.status).to.equal('PENDING');
          });

          it('should not do the fetch', function () {
            expect(locally).to.not.be.called;
          });
        });

        describe('when the fetch result has failed', function () {
          beforeEach(function () {
            locally = sinon.spy();
            expectedError = new Error();
            actualResult = store.fetch({
              id: 'foo',
              locally: locally,
              dependsOn: store.fetch.failed(expectedError)
            });
          });

          it('should return a failed result', function () {
            expect(actualResult.status).to.equal('FAILED');
          });

          it('should return the original error', function () {
            expect(actualResult.error).to.equal(expectedError);
          });

          it('should not do the fetch', function () {
            expect(locally).to.not.be.called;
          });
        });

        describe('when the fetch result is done', function () {
          beforeEach(function () {
            expectedResult = { foo: 'bar' };
            actualResult = store.fetch({
              id: 'foo',
              dependsOn: store.fetch.done(),
              locally: function () {
                return expectedResult;
              }
            });
          });

          it('should do the fetch', function () {
            expect(actualResult.result).to.equal(expectedResult);
          });
        });
      });

      describe('when you pass it an array of fetch results', function () {
        describe('when any of fetch results are pending', function () {
          beforeEach(function () {
            locally = sinon.spy();
            actualResult = store.fetch({
              id: 'foo',
              locally: locally,
              dependsOn: [
                store.fetch.done(),
                store.fetch.pending()
              ]
            });
          });

          it('should return a pending result', function () {
            expect(actualResult.status).to.equal('PENDING');
          });

          it('should not do the fetch', function () {
            expect(locally).to.not.be.called;
          });
        });

        describe('when any the fetch results have failed', function () {
          var expectedError2;

          beforeEach(function () {
            locally = sinon.spy();
            expectedError = new Error();
            expectedError2 = new Error();
            actualResult = store.fetch({
              id: 'foo',
              locally: locally,
              dependsOn: [
                store.fetch.done(),
                store.fetch.failed(expectedError),
                store.fetch.pending(),
                store.fetch.failed(expectedError2)
              ]
            });
          });

          it('should return a failed result', function () {
            expect(actualResult.status).to.equal('FAILED');
          });

          it('should not do the fetch', function () {
            expect(locally).to.not.be.called;
          });

          it('should have all the errors', function () {
            expect(actualResult.error.errors).to.contain(expectedError);
            expect(actualResult.error.errors).to.contain(expectedError2);
          });
        });

        describe('when all of the fetch results are done', function () {
          beforeEach(function () {
            expectedResult = { foo: 'bar' };
            actualResult = store.fetch({
              id: 'foo',
              dependsOn: [
                store.fetch.done(),
                store.fetch.done()
              ],
              locally: function () {
                return expectedResult;
              }
            });
          });

          it('should do the fetch', function () {
            expect(actualResult.result).to.equal(expectedResult);
          });
        });
      });
    });

    describe('#cacheError', function () {
      beforeEach(function () {
        expectedError = new Error();
        locally = sinon.spy(function () {
          throw expectedError;
        });
      });

      describe('when cacheError is true', function () {
        beforeEach(function () {
          store.fetch({
            id: 'foo',
            locally: locally,
            cacheError: true
          });

          store.fetch({
            id: 'foo',
            locally: locally,
            cacheError: true
          });
        });

        it('will cache the error', function () {
          expect(locally).to.be.calledOnce;
        });
      });

      describe('when cacheError is false', function () {
        beforeEach(function () {
          store.fetch({
            id: 'foo',
            locally: locally,
            cacheError: false
          });

          store.fetch({
            id: 'foo',
            locally: locally,
            cacheError: false
          });
        });

        it('will cache the error', function () {
          expect(locally).to.be.calledTwice;
        });
      });
    });

  });

  describe('when you dont pass in a id', function () {
    it('should throw an error', function () {
      expect(function () { store.fetch(); }).to.throw(Error);
    });
  });

  describe('when a fetch with the given id is in progress', function () {
    beforeEach(function () {
      expectedResult = store.fetch(fetchId, noop, function () {
        return new Promise(function (resolve) { endFetch = resolve; });
      });
    });

    it('should return the in progress fetch', function () {
      actualResult = store.fetch(fetchId, noop, noop);

      expect(actualResult).to.eql(expectedResult);
    });
  });

  describe('when the local fetch returns a value', function () {
    beforeEach(function () {
      expectedResult = {foo: 'bar'};

      actualResult = store.fetch('foo', function () {
        actualContext = this;
        return expectedResult;
      });
    });

    it('should have a status of done', function () {
      expect(actualResult.status).to.equal('DONE');
    });

    it('should say it is done', function () {
      expect(actualResult.done).to.be.true;
    });

    it('should have the result', function () {
      expect(actualResult.result).to.equal(expectedResult);
    });

    it('should set the context to the store', function () {
      expect(actualContext).to.equal(store);
    });
  });

  describe('when the local fetch throws an exception', function () {
    beforeEach(function () {
      expectedError = new Error();

      actualResult = store.fetch('foo', function () {
        throw expectedError;
      });
    });

    it('should have a status of failed', function () {
      expect(actualResult.status).to.equal('FAILED');
    });

    it('should say its failed', function () {
      expect(actualResult.failed).to.be.true;
    });

    it('should have the result', function () {
      expect(actualResult.error).to.equal(expectedError);
    });
  });

  describe('when the local fetch does not return a value', function () {
    describe('when the remote fetch returns null', function () {
      beforeEach(function () {
        actualResult = store.fetch('foo', noop, noop);
      });

      it('should have a status of failed', function () {
        expect(actualResult.status).to.equal('FAILED');
      });

      it('should say its failed', function () {
        expect(actualResult.failed).to.be.true;
      });

      it('should have the result', function () {
        expect(actualResult.error.status).to.eql(404);
      });
    });

    describe('when the remote fetch throws an exception', function () {
      beforeEach(function () {
        expectedError = new Error();

        actualResult = store.fetch('foo', noop, function () {
          throw expectedError;
        });
      });

      it('should have a status of failed', function () {
        expect(actualResult.status).to.equal('FAILED');
      });

      it('should say its failed', function () {
        expect(actualResult.failed).to.be.true;
      });

      it('should have the error', function () {
        expect(actualResult.error).to.equal(expectedError);
      });
    });

    describe('when the remote fetch returns a promise', function () {
      describe('when the promise fails', function () {
        beforeEach(function (done) {
          expectedError = new Error();

          store.fetch('foo', noop, function () {
            return new Promise(function (resolve, reject) {
              reject(expectedError);
            });
          });

          store.addChangeListener(function () {
            actualResult = store.fetch('foo', noop, noop);
            done();
          });
        });

        it('should have a status of failed', function () {
          expect(actualResult.status).to.equal('FAILED');
        });

        it('should say its failed', function () {
          expect(actualResult.failed).to.be.true;
        });

        it('should have the error', function () {
          expect(actualResult.error).to.equal(expectedError);
        });
      });

      describe('when the promise completes done', function () {
        describe('when the local fetch then returns a value', function () {
          var localResult;

          beforeEach(function (done) {
            localResult = null;
            expectedResult = { foo: 'bar' };

            store.fetch('foo', function () {
              return localResult;
            }, function () {
              remoteFetch = new Promise(function (resolve) {
                localResult = expectedResult;
                resolve();
              });

              return remoteFetch;
            });

            remoteFetch.then(function () {
              actualResult = store.fetch('foo', function () {
                return localResult;
              });

              done();
            });
          });

          it('should have a status of done', function () {
            expect(actualResult.status).to.equal('DONE');
          });

          it('should say it is done', function () {
            expect(actualResult.done).to.be.true;
          });

          it('should have the result', function () {
            expect(actualResult.result).to.equal(expectedResult);
          });
        });

        describe('when the local fetch then does not return a value', function () {
          beforeEach(function (done) {
            store.fetch('foo', noop, function () {
              return new Promise(function (resolve) {
                resolve();
              });
            });

            store.addChangeListener(function () {
              actualResult = store.fetch('foo');
              done();
            });
          });

          it('should have a status of failed', function () {
            expect(actualResult.status).to.equal('FAILED');
          });

          it('should say its failed', function () {
            expect(actualResult.failed).to.be.true;
          });

          it('should have the error', function () {
            expect(actualResult.error.status).to.eql(404);
          });
        });
      });
    });
  });

  describe('#when()', function () {
    var fetch;

    describe('when the fetch is pending', function () {
      beforeEach(function () {
        fetch = store.fetch.pending();
      });

      describe('when there is a pending callback', function () {
        beforeEach(function () {
          expectedResult = 10;
          actualResult = fetch.when({
            pending: function () {
              return expectedResult;
            }
          });
        });

        it('should execute the pending callback', function () {
          expect(actualResult).to.equal(expectedResult);
        });
      });

      describe('when there is NOT a pending callback', function () {
        it('should throw an error', function () {
          expect(function () { fetch.when(); }).throw(Error);
        });
      });
    });

    describe('when the fetch has failed', function () {
      beforeEach(function () {
        expectedError = new Error();
        fetch = store.fetch.failed(expectedError);
      });

      describe('when there is a failed callback', function () {
        beforeEach(function () {
          expectedResult = 10;
          actualResult = fetch.when({
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
          expect(function () { fetch.when(); }).throw(Error);
        });
      });
    });

    describe('when the fetch is done', function () {
      beforeEach(function () {
        expectedResult = { foo: 1 };
        fetch = store.fetch.done(expectedResult);
      });

      describe('when there is a done callback', function () {
        beforeEach(function () {
          expectedResult = 10;
          actualResult = fetch.when({
            done: function (fetchResult) {
              actualResult = fetchResult;
              return expectedResult;
            }
          });
        });

        it('should execute the done callback', function () {
          expect(actualResult).to.equal(expectedResult);
        });

        it('should pass in the fetch result', function () {
          expect(actualResult).to.equal(expectedResult);
        });
      });

      describe('when there is NOT a done callback', function () {
        it('should throw an error', function () {
          expect(function () { fetch.when(); }).throw(Error);
        });
      });
    });
  });

  describe('#pending()', function () {
    beforeEach(function () {
      actualResult = store.fetch.pending(expectedResult);
    });

    it('should have a status of pending', function () {
      expect(actualResult.status).to.equal('PENDING');
    });

    it('should say it is pending', function () {
      expect(actualResult.pending).to.be.true;
    });
  });

  describe('#failed()', function () {
    beforeEach(function () {
      expectedError = new Error();
      actualResult = store.fetch.failed(expectedError);
    });

    it('should have a status of failed', function () {
      expect(actualResult.status).to.equal('FAILED');
    });

    it('should say it is failed', function () {
      expect(actualResult.failed).to.be.true;
    });

    it('should have the error', function () {
      expect(actualResult.error).to.equal(expectedError);
    });
  });

  describe('#done()', function () {
    beforeEach(function () {
      expectedResult = { foo: 'bar '};
      actualResult = store.fetch.done(expectedResult);
    });

    it('should have a status of done', function () {
      expect(actualResult.status).to.equal('DONE');
    });

    it('should say it is done', function () {
      expect(actualResult.done).to.be.true;
    });

    it('should have the result', function () {
      expect(actualResult.result).to.equal(expectedResult);
    });
  });

  function noop() {
  }
});