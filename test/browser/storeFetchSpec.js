var _ = require('lodash');
var sinon = require('sinon');
var fetch = require('../../fetch');
var Marty = require('../../marty');
var expect = require('chai').expect;
var warnings = require('../../lib/warnings');
var Promise = require('es6-promise').Promise;
var MockDispatcher = require('./lib/mockDispatcher');

describe('Store#fetch()', function () {
  var listener, store, changeListener, endFetch, remoteFetch, fetchId, dispatcher;
  var expectedResult, actualResult, actualContext, expectedError, actualError;

  beforeEach(function () {
    warnings.stateIsNullOrUndefined = false;
    warnings.promiseNotReturnedFromRemotely = false;

    fetchId = 'foo';
    listener = sinon.spy();
    dispatcher = new MockDispatcher();
    store = Marty.createStore({
      id: 'storeFetch',
      displayName: 'Test',
      getInitialState: _.noop,
      dispatcher: dispatcher
    });
    changeListener = store.addChangeListener(listener);
  });

  afterEach(function () {
    store.dispose();
    endFetch && endFetch();
    changeListener.dispose();
    warnings.stateIsNullOrUndefined = true;
    warnings.promiseNotReturnedFromRemotely = true;
  });

  describe('#hasAlreadyFetched()', function () {
    beforeEach(function () {
      store = Marty.createStore({
        id: 'hasAlreadyFetched',
        displayName: 'Test',
        getInitialState: _.noop,
        fetchFoo: function () {
          return this.fetch(fetchId, function () {
            return 'foo';
          });
        }
      });
    });

    describe('when you have never fetched that key before', function () {
      it('should return false', function () {
        expect(store.hasAlreadyFetched(fetchId)).to.be.false;
      });
    });

    describe('when a fetch has previously completed', function () {
      beforeEach(function () {
        store.fetchFoo();
      });

      it('should return true', function () {
        expect(store.hasAlreadyFetched(fetchId)).to.be.true;
      });
    });
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

    describe('#toPromise', function () {
      describe('when a fetch is done', function () {
        var actualPromise, expectedState, localState, getState;

        beforeEach(function () {
          expectedState = { foo: 'bar' };

          actualPromise = store.fetch({
            id: 'locally',
            locally: function () {
              return localState;
            },
            remotely: function () {
              return new Promise(function (resolve) {
                localState = expectedState;
                resolve();
              });
            }
          }).toPromise();
        });

        it('should resolve the promise', function () {
          return expect(actualPromise).to.eventually.eql(expectedState);
        });
      });

      describe('when a fetch fails', function () {
        var actualPromise, expectedError;

        beforeEach(function () {
          expectedError = new Error('foo');

          actualPromise = store.fetch({
            id: 'locally',
            locally: function () {},
            remotely: function () {
              return new Promise(function (resolve, reject) {
                reject(expectedError);
              });
            }
          }).toPromise();
        });

        it('should reject the promise', function () {
          return expect(actualPromise).to.be.rejectedWith(expectedError);
        });
      });

      describe('fetch.done().toPromise()', function () {
        var result, expectedResult;

        beforeEach(function () {
          expectedResult = { foo: 'bar' };
          result = fetch.done(expectedResult).toPromise();
        });

        it('should resolve the promise', function () {
          return expect(result).to.eventually.equal(expectedResult);
        });
      });

      describe('fetch.failed().toPromise()', function () {
        var result, expectedError;

        beforeEach(function () {
          expectedError = new Error('foo');
          result = fetch.failed(expectedError).toPromise();
        });

        it('should resolve the promise', function () {
          return expect(result).to.be.rejectedWith(expectedError);
        });
      });
    });

    describe('#dependsOn', function () {
      var Store1, Store2, changeListener, fooQueryResult, barQueryResult, store2ChangeListener;

      beforeEach(function () {
        store2ChangeListener = sinon.spy();

        Store1 = Marty.createStore({
          id: 'Store1',
          foo: function () {
            return this.fetch({
              id: 'foo',
              locally: function () {
                return fooQueryResult;
              },
              remotely: function () {
                return new Promise(function (resolve) {
                  setTimeout(function () {
                    fooQueryResult = { foo: 'bar' };
                    resolve();
                  }, 1);
                });
              }
            })
          },
          bar: function () {
            return this.fetch({
              id: 'bar',
              locally: function () {
                return barQueryResult;
              },
              remotely: function () {
                return new Promise(function (resolve) {
                  setTimeout(function () {
                    barQueryResult = { bar: 'bar' };
                    resolve();
                  }, 1);
                });
              }
            })
          },
        });

        Store2 = Marty.createStore({
          id: 'Store2',
          singleDependency: function () {
            return this.fetch({
              id: 'singleDependency',
              dependsOn: Store1.foo(),
              locally: function () {
                return { bar: 'baz' };
              }
            })
          },
          multipleDependencies: function () {
            return this.fetch({
              id: 'multipleDependencies',
              dependsOn: [Store1.foo(), Store1.bar()],
              locally: function () {
                return { bar: 'baz' };
              }
            })
          }
        });

        Store2.addChangeListener(store2ChangeListener);
      });

      describe('when there is one pending dependency', function () {
        beforeEach(function () {
          return Store2.singleDependency().toPromise();
        });

        it('should trigger the store to update', function () {
          expect(store2ChangeListener).to.be.calledOnce;
        });
      });

      describe('when there are two pending dependency', function () {
        beforeEach(function () {
          return Store2.multipleDependencies().toPromise();
        });

        it('should trigger the store to update', function () {
          expect(store2ChangeListener).to.be.calledOnce;
        });
      });

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
      var remotely;

      beforeEach(function () {
        expectedError = new Error();
        locally = sinon.stub();
        remotely = sinon.spy(function () {
          return new Promise(function (resolve, reject) {
            reject(expectedError);
          });
        });
      });

      describe('when cacheError is true', function () {
        beforeEach(function () {
          store.fetch({
            id: 'foo',
            locally: locally,
            remotely: remotely,
            cacheError: true
          });

          store.fetch({
            id: 'foo',
            locally: locally,
            remotely: remotely,
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

  describe('when you pass valid, but falsy id', function () {
    it('should not throw an error', function () {
      expect(function () { store.fetch({id: 0}); }).not.to.throw(Error);
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

      expect(omitPromise(actualResult)).to.eql(omitPromise(expectedResult));
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

  describe('when the local fetch returns null', function () {
    var remotely;

    beforeEach(function () {
      remotely = sinon.spy();
      actualResult = store.fetch('bar', function () {
        return null;
      }, remotely);
    });

    it('should return a fetch not found result', function () {
      expect(omitPromise(actualResult)).to.eql(omitPromise(store.fetch.notFound('bar', store)));
    });

    it('should not call remotely', function () {
      expect(remotely).to.not.be.called;
    });
  });

  describe('when the local fetch returns undefined', function () {
    describe('when the remote fetch returns undefined', function () {
      beforeEach(function () {
        actualResult = store.fetch('whatever', noop, noop);
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

    describe('when the remote fetch returns a promise', function () {
      describe('when the promise rejects', function () {
        var remoteFetch, fetchFailedAction;

        beforeEach(function (done) {
          expectedError = new Error();

          store.fetch('foo', noop, function () {
            return new Promise(function (resolve, reject) {
              reject(expectedError);
            });
          });

          store.addChangeListener(function () {
            actualResult = store.fetch('foo', noop, noop);

            setTimeout(function () {
              fetchFailedAction = dispatcher.getActionWithType('FETCH_FAILED');
              done();
            }, 1);
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

        it('should dispatch a FETCH_FAILED action', function () {
          expect(fetchFailedAction).to.exist;
        });

        it('should include fetch, store and error in the FETCH_FAILED action', function () {
          expect(fetchFailedAction.arguments).to.eql([
            expectedError,
            'foo',
            store
          ]);
        });

        describe('when I try to call the fetch again', function () {
          beforeEach(function () {
            remoteFetch = sinon.spy();
            store.fetch({
              id: 'foo',
              locally: noop,
              cacheError: false,
              remotely: remoteFetch
            });
          });

          it('should call the remote fetch again', function () {
            expect(remoteFetch).to.have.been.calledOnce;
          });
        });
      });

      describe('when the promise resolves', function () {
        describe('when the local fetch then returns a value', function () {
          var localResult;

          beforeEach(function (done) {
            localResult = null;
            expectedResult = { foo: 'bar' };

            store.fetch('foo', function () {
              if (localResult) {
                return localResult;
              }
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

  function omitPromise(result) {
    return _.omit(result, 'toPromise');
  }

  function noop() {
  }
});