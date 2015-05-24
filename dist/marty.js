(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Marty = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.1.1
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    function lib$es6$promise$asap$$asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$es6$promise$asap$$scheduleFlush();
      }
    }

    var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$default(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$default(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


},{}],2:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    // TODO: Request constructor should accept input, init
    var request
    if (Request.prototype.isPrototypeOf(input) && !init) {
      request = input
    } else {
      request = new Request(input, init)
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

},{}],3:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require(2);
module.exports = self.fetch;

},{"2":2}],4:[function(require,module,exports){
'use strict';

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var DispatchCoordinator = require(28);

var ActionCreators = (function (_DispatchCoordinator) {
  function ActionCreators(options) {
    _classCallCheck(this, ActionCreators);

    _get(Object.getPrototypeOf(ActionCreators.prototype), 'constructor', this).call(this, 'ActionCreators', options);
  }

  _inherits(ActionCreators, _DispatchCoordinator);

  return ActionCreators;
})(DispatchCoordinator);

module.exports = ActionCreators;

},{"28":28}],5:[function(require,module,exports){
'use strict';

var _ = require(63);

function autoDispatch(constant) {
  return function () {
    var args = _.toArray(arguments);

    args.unshift(constant);

    this.dispatch.apply(this, args);
  };
}

module.exports = autoDispatch;

},{"63":63}],6:[function(require,module,exports){
'use strict';

var _ = require(63);
var createClass = require(25);
var ActionCreators = require(4);
var RESERVED_KEYWORDS = ['dispatch'];

function createActionCreatorsClass(properties) {
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error('' + keyword + ' is a reserved keyword');
    }
  });

  var classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, ActionCreators);
}

module.exports = createActionCreatorsClass;

},{"25":25,"4":4,"63":63}],7:[function(require,module,exports){
'use strict';

module.exports = function (marty) {
  marty.autoDispatch = require(5);
  marty.ActionCreators = require(4);
  marty.createActionCreators = require(6);
};

},{"4":4,"5":5,"6":6}],8:[function(require,module,exports){
'use strict';

var findApp = require(30);
var appProperty = require(24);

module.exports = function (React) {
  return function () {
    var contextTypes = {
      app: React.PropTypes.object
    };

    return {
      contextTypes: contextTypes,
      childContextTypes: contextTypes,
      getChildContext: function getChildContext() {
        return { app: findApp(this) };
      },
      getInitialState: function getInitialState() {
        appProperty(this);

        return {};
      }
    };
  };
};
/*...dependencies*/

},{"24":24,"30":30}],9:[function(require,module,exports){
'use strict';

module.exports = function (marty, React) {
  marty.createAppMixin = require(8)(React);
};

},{"8":8}],10:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _ = require(63);
var log = require(32);
var invariant = require(87);
var timeout = require(42);
var deferred = require(40);
var _renderToString = require(15);
var FetchDiagnostics = require(13);
var createDispatcher = require(26);
var UnknownStoreError = require(49);
var DEFAULT_TIMEOUT = 1000;
var SERIALIZED_WINDOW_OBJECT = '__marty';

module.exports = function (React) {
  var Application = (function () {
    function Application(options) {
      _classCallCheck(this, Application);

      options = options || {};

      var dispatcher = createDispatcher();

      // Needed because we don't have access to actual Application type
      this.__isApplication = true;
      this.__isCoreType = true;
      this.__types = {};

      Object.defineProperty(this, 'dispatcher', {
        get: function get() {
          return dispatcher;
        }
      });

      this.req = options.req;
      this.res = options.res;

      if (options.register) {
        this.register(options.register);
      }

      currentApplicationIs(this);
    }

    _createClass(Application, [{
      key: 'getAll',
      value: function getAll(type) {
        return this.__types[type] || {};
      }
    }, {
      key: 'getAllStores',
      value: function getAllStores() {
        return this.getAll('Store');
      }
    }, {
      key: 'register',
      value: function register(id, ctor) {
        var _this = this;

        if (!this.dispatcher) {
          throw new Error('`super()` must be called before you can register anything');
        }

        if (!id) {
          throw new Error('Must specify a id or an object');
        }

        if (_.isString(id)) {
          if (!_.isFunction(ctor)) {
            throw new Error('Must pass in a instantiable object');
          }

          var obj = new ctor({
            app: this,
            id: id
          });

          obj.id = id;

          var type = obj.__type;

          if (type) {
            if (!this.__types[type]) {
              this.__types[type] = {};
            }

            this.__types[type][id] = obj;
          }

          if (id.indexOf('.') === -1) {
            this[id] = obj;
          } else {
            var container = this;
            var parts = id.split('.');

            _.each(_.initial(parts), function (part) {
              if (_.isUndefined(container[part])) {
                container[part] = {};
              }

              container = container[part];
            });

            container[_.last(parts)] = obj;
          }
        }

        if (_.isObject(id)) {
          (function () {
            var registerObject = function registerObject(obj, prefix) {
              _.each(obj, function (ctor, id) {
                if (prefix) {
                  id = '' + prefix + '.' + id;
                }

                if (_.isFunction(ctor)) {
                  _this.register(id, ctor);
                } else {
                  registerObject(ctor, id);
                }
              });
            };

            registerObject(id);
          })();
        }
      }
    }, {
      key: 'fetch',
      value: function fetch(cb, options) {
        var _this2 = this;

        var fetchFinished = undefined;

        options = _.defaults(options || {}, {
          timeout: DEFAULT_TIMEOUT
        });

        this.__deferredFetchFinished = deferred();
        fetchFinished = this.__deferredFetchFinished.promise;
        this.__diagnostics = new FetchDiagnostics(options.prevDiagnostics);

        try {
          cb.call(this);
        } catch (e) {
          this.__deferredFetchFinished.reject(e);

          return fetchFinished;
        }

        if (!this.__diagnostics.hasPendingFetches) {
          this.__deferredFetchFinished.resolve();
        }

        return Promise.race([fetchFinished, timeout(options.timeout)]).then(function () {
          return _this2.__diagnostics;
        });
      }
    }, {
      key: 'fetchStarted',
      value: function fetchStarted(storeId, fetchId) {
        var diagnostics = this.__diagnostics;

        if (diagnostics) {
          diagnostics.fetchStarted(storeId, fetchId);
        }
      }
    }, {
      key: 'fetchFinished',
      value: function fetchFinished(storeId, fetchId, status, options) {
        var diagnostics = this.__diagnostics;

        if (diagnostics) {
          diagnostics.fetchFinished(storeId, fetchId, status, options);

          if (!diagnostics.hasPendingFetches) {
            this.__deferredFetchFinished.resolve();
          }
        }
      }
    }, {
      key: 'clearState',
      value: function clearState() {
        _.invoke(this.getAllStores(), 'clear');
      }
    }, {
      key: 'replaceState',
      value: function replaceState(states) {
        _.each(this.getAllStores(), function (store, id) {
          if (states[id]) {
            store.replaceState(states[id]);
          }
        });
      }
    }, {
      key: 'rehydrate',
      value: function rehydrate(storeStates) {
        var stores = this.getAllStores();

        storeStates = storeStates || getStoreStatesFromWindow();

        _.each(storeStates, function (dehydratedStore, storeId) {
          var store = stores[storeId];
          var state = dehydratedStore.state;

          if (!store) {
            throw new UnknownStoreError(storeId);
          }

          store.__fetchHistory = dehydratedStore.fetchHistory;

          if (_.isFunction(store.rehydrate)) {
            store.rehydrate(state);
          } else {
            try {
              store.replaceState(state);
            } catch (e) {
              log.error('Failed to rehydrate the state of ' + storeId + '. You might be able ' + 'to solve this problem by implementing Store#rehydrate()');

              throw e;
            }
          }
        });

        function getStoreStatesFromWindow() {
          if (!window || !window[SERIALIZED_WINDOW_OBJECT]) {
            return;
          }

          return window[SERIALIZED_WINDOW_OBJECT].stores;
        }
      }
    }, {
      key: 'dehydrate',
      value: function dehydrate() {
        var dehydratedStores = {};
        var stores = this.getAllStores();

        _.each(stores, function (store, id) {
          dehydratedStores[id] = {
            fetchHistory: store.__fetchHistory,
            state: (store.dehydrate || store.getState).call(store)
          };
        });

        dehydratedStores.toString = function () {
          return '(window.__marty||(window.__marty={})).stores=' + JSON.stringify(dehydratedStores);
        };

        dehydratedStores.toJSON = function () {
          return _.omit(dehydratedStores, 'toString', 'toJSON');
        };

        return dehydratedStores;
      }
    }, {
      key: 'renderToString',
      value: function renderToString(element, options) {
        var _this3 = this;

        return _renderToString(this, React.renderToString, function () {
          return elementWithApp(element, _this3);
        }, options);
      }
    }, {
      key: 'renderToStaticMarkup',
      value: function renderToStaticMarkup(element, options) {
        var _this4 = this;

        return _renderToString(this, React.renderToStaticMarkup, function () {
          return elementWithApp(element, _this4);
        }, options);
      }
    }], [{
      key: '__getCurrentApplication',
      value: function __getCurrentApplication(cb) {
        return getCurrentApplication(cb);
      }
    }]);

    return Application;
  })();

  // Internal API used by DevTools to access the current application
  var currentApplication = undefined;
  var currentApplicationRequests = [];

  function currentApplicationIs(app) {
    currentApplication = app;
    _.each(currentApplicationRequests, function (cb) {
      return cb(app);
    });
    currentApplicationRequests = [];
  }

  function getCurrentApplication(cb) {
    if (currentApplication) {
      cb(currentApplication);
    } else {
      currentApplicationRequests.push(cb);
    }
  }

  function elementWithApp(element, app) {
    invariant(element && (typeof element.type === 'function' || typeof element.type === 'string'), 'Must pass in a React component');

    return React.cloneElement(element, {
      app: app
    });
  }

  return Application;
};

},{"13":13,"15":15,"26":26,"32":32,"40":40,"42":42,"49":49,"63":63,"87":87}],11:[function(require,module,exports){
'use strict';

var findApp = require(30);

var _require = require(63);

var isArray = _require.isArray;
var extend = _require.extend;

module.exports = function (React) {
  var ApplicationContainer = React.createClass({
    displayName: 'ApplicationContainer',

    childContextTypes: {
      app: React.PropTypes.object
    },
    getChildContext: function getChildContext() {
      return { app: findApp(this) };
    },
    render: function render() {
      var _props = this.props;
      var app = _props.app;
      var children = _props.children;

      if (children) {
        if (isArray(children)) {
          return React.createElement('span', null, React.Children.map(children, cloneWithApp));
        } else {
          return cloneWithApp(children);
        }
      }

      function cloneWithApp(element) {
        return React.createElement(element.type, extend({
          app: app
        }, element.props));
      }
    }
  });

  return ApplicationContainer;
};

},{"30":30,"63":63}],12:[function(require,module,exports){
"use strict";

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

module.exports = function (MartyApplication) {
  return function createApplication(ctor) {
    var Application = (function (_MartyApplication) {
      function Application(options) {
        _classCallCheck(this, Application);

        _get(Object.getPrototypeOf(Application.prototype), "constructor", this).call(this, options);
        ctor.call(this, options);
      }

      _inherits(Application, _MartyApplication);

      return Application;
    })(MartyApplication);

    return Application;
  };
};

},{}],13:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _ = require(63);

var FetchDiagnostics = (function () {
  function FetchDiagnostics(prevDiagnostics) {
    _classCallCheck(this, FetchDiagnostics);

    prevDiagnostics = prevDiagnostics || {
      fetches: [],
      numberOfPendingFetches: 0
    };

    this.numberOfNewFetchesMade = 0;
    this.fetches = prevDiagnostics.fetches;
    this.numberOfPendingFetches = prevDiagnostics.numberOfPendingFetches;
  }

  _createClass(FetchDiagnostics, [{
    key: 'fetchStarted',
    value: function fetchStarted(storeId, fetchId) {
      var fetch = this.getFetch(storeId, fetchId);

      if (!fetch) {
        this.numberOfNewFetchesMade++;
      }

      this.numberOfPendingFetches++;
      this.fetches.push({
        status: 'PENDING',
        storeId: storeId,
        fetchId: fetchId,
        startTime: new Date()
      });
    }
  }, {
    key: 'fetchFinished',
    value: function fetchFinished(storeId, fetchId, status, options) {
      var fetch = this.getFetch(storeId, fetchId);

      if (fetch) {
        _.extend(fetch, {
          status: status,
          time: new Date() - fetch.startTime
        }, options);

        this.numberOfPendingFetches--;
      }
    }
  }, {
    key: 'getFetch',
    value: function getFetch(storeId, fetchId) {
      return _.find(this.fetches, {
        storeId: storeId,
        fetchId: fetchId
      });
    }
  }, {
    key: 'hasPendingFetches',
    get: function get() {
      return this.numberOfPendingFetches > 0;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return _.map(this.fetches, fetchWithTime);

      function fetchWithTime(fetch) {
        if (_.isUndefined(fetch.time)) {
          fetch.time = new Date() - fetch.startTime;
        }

        delete fetch.startTime;

        return fetch;
      }
    }
  }]);

  return FetchDiagnostics;
})();

module.exports = FetchDiagnostics;

},{"63":63}],14:[function(require,module,exports){
'use strict';

module.exports = function (marty, React) {
  var Application = require(10)(React);

  marty.ApplicationContainer = require(11)(React);
  marty.createApplication = require(12)(Application);
  marty.Application = Application;
  marty.contextTypes = {
    app: React.PropTypes.instanceOf(Application)
  };
};

},{"10":10,"11":11,"12":12}],15:[function(require,module,exports){
'use strict';

var _ = require(63);
var MAX_NUMBER_OF_ITERATIONS = 10;
var invariant = require(87);

function renderToString(app, render, createElement, options) {
  options = _.defaults(options || {}, {
    maxNumberOfIterations: MAX_NUMBER_OF_ITERATIONS
  });

  invariant(app, 'Must specify the application');
  invariant(render, 'Must specify the render function');
  invariant(_.isFunction(createElement), 'Must specify the element factory');

  var totalIterations = 0;
  var fetchOptions = { timeout: options.timeout };

  return new Promise(function (resolve, reject) {
    var element = createElement();

    resolveFetches().then(dehydrateAndRenderHtml);

    function dehydrateAndRenderHtml(diagnostics) {
      app.fetch(function () {
        try {
          var html = render(element);
          html += dehydratedState();
          resolve({
            html: html,
            diagnostics: diagnostics.toJSON()
          });
        } catch (e) {
          reject(e);
        }
      }, fetchOptions);
    }

    // Repeatedly re-render the component tree until
    // we no longer make any new fetches
    function resolveFetches(prevDiagnostics) {
      return waitForFetches(prevDiagnostics).then(function (diagnostics) {
        if (diagnostics.numberOfNewFetchesMade === 0) {
          return diagnostics;
        }

        if (totalIterations > options.maxNumberOfIterations) {
          return diagnostics;
        }

        totalIterations++;
        return resolveFetches(diagnostics);
      });
    }

    function waitForFetches(prevDiagnostics) {
      var options = _.extend({
        prevDiagnostics: prevDiagnostics
      }, fetchOptions);

      return app.fetch(function () {
        try {
          render(element);
        } catch (e) {
          reject(e);
        }
      }, options);
    }

    function dehydratedState() {
      return '<script id="__marty-state">' + app.dehydrate() + '</script>';
    }
  });
}

module.exports = renderToString;

},{"63":63,"87":87}],16:[function(require,module,exports){
'use strict';

var _ = require(63);

function constants(obj) {
  return toConstant(obj);

  function toConstant(obj) {
    if (!obj) {
      return {};
    }

    if (_.isArray(obj)) {
      return arrayToConstants(obj);
    }

    if (_.isObject(obj)) {
      return objectToConstants(obj);
    }
  }

  function objectToConstants(obj) {
    return _.object(_.map(obj, valueToArray));

    function valueToArray(value, actionType) {
      return [actionType, toConstant(value)];
    }
  }

  function arrayToConstants(array) {
    var constants = {};

    _.each(array, function (actionType) {
      var types = [actionType, actionType + '_STARTING', actionType + '_DONE', actionType + '_FAILED'];

      _.each(types, function (type) {
        constants[type] = type;
      });
    });

    return constants;
  }
}

module.exports = constants;

},{"63":63}],17:[function(require,module,exports){
'use strict';

module.exports = function (marty) {
  marty.createConstants = require(16);
};

},{"16":16}],18:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _ = require(63);
var findApp = require(30);
var uuid = require(43);
var getFetchResult = require(19);
var appProperty = require(24);
var StoreObserver = require(39);
var getClassName = require(41);

var RESERVED_FUNCTIONS = ['contextTypes', 'componentDidMount', 'onStoreChanged', 'componentWillUnmount', 'getInitialState', 'getState', 'render'];

module.exports = function (React) {
  var DEFAULT_CONTEXT_TYPES = {
    app: React.PropTypes.object };

  return function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    var id = uuid.type('Component');
    var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    var contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, config.contextTypes);

    InnerComponent.contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, InnerComponent.contextTypes);

    appProperty(InnerComponent.prototype);

    var Container = React.createClass(_.extend({
      contextTypes: contextTypes,
      childContextTypes: DEFAULT_CONTEXT_TYPES,
      getChildContext: function getChildContext() {
        return { app: findApp(this) };
      },
      componentDidMount: function componentDidMount() {
        var component = {
          id: id,
          displayName: innerComponentDisplayName
        };

        this.observer = new StoreObserver({
          app: this.app,
          component: component,
          stores: this.listenTo,
          onStoreChanged: this.onStoreChanged
        });

        if (_.isFunction(config.componentDidMount)) {
          config.componentDidMount.call(this);
        }
      },
      componentWillMount: function componentWillMount() {
        if (_.isFunction(config.componentWillMount)) {
          config.componentWillMount.call(this);
        }
      },
      componentWillReceiveProps: function componentWillReceiveProps(props) {
        this.props = props;
        this.setState(this.getState(props));

        if (_.isFunction(config.componentWillReceiveProps)) {
          config.componentWillReceiveProps.call(this, props);
        }
      },
      componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
        if (_.isFunction(config.componentWillUpdate)) {
          config.componentWillUpdate.call(this, nextProps, nextState);
        }
      },
      componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        if (_.isFunction(config.componentDidUpdate)) {
          config.componentDidUpdate.call(this, prevProps, prevState);
        }
      },
      onStoreChanged: function onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount: function componentWillUnmount() {
        if (this.observer) {
          this.observer.dispose();
        }

        if (_.isFunction(config.componentWillUnmount)) {
          config.componentWillUnmount.call(this);
        }
      },
      getInitialState: function getInitialState() {
        appProperty(this);
        return this.getState();
      },
      getState: function getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done: function done(results) {
        return React.createElement(InnerComponent, _extends({ ref: 'innerComponent' }, this.props, results, { app: this.app }));
      },
      getInnerComponent: function getInnerComponent() {
        return this.refs.innerComponent;
      },
      render: function render() {
        var container = this;
        var result = this.state.result;

        return result.when({
          done: function done(results) {
            if (_.isFunction(container.done)) {
              return container.done(results);
            }

            throw new Error('The `done` handler must be a function');
          },
          pending: function pending() {
            if (_.isFunction(container.pending)) {
              return container.pending(result.result);
            }

            return false;
          },
          failed: function failed(error) {
            if (_.isFunction(container.failed)) {
              return container.failed(error);
            }

            throw error;
          }
        });
      }
    }, _.omit(config, RESERVED_FUNCTIONS)));

    Container.InnerComponent = InnerComponent;
    Container.displayName = innerComponentDisplayName + 'Container';

    return Container;
  };
};

},{"19":19,"24":24,"30":30,"39":39,"41":41,"43":43,"63":63}],19:[function(require,module,exports){
'use strict';

var log = require(32);
var _ = require(63);
var fetch = require(72);

function getFetchResult(component) {
  var errors = {};
  var results = {};
  var isPending = false;
  var hasFailed = false;
  var fetches = invokeFetches(component);

  _.each(fetches, function (fetch, key) {
    if (fetch.done) {
      results[key] = fetch.result;
    } else if (fetch.pending) {
      isPending = true;
    } else if (fetch.failed) {
      hasFailed = true;
      errors[key] = fetch.error;
    }
  });

  if (hasFailed) {
    return fetch.failed(errors);
  }

  if (isPending) {
    return _.extend(fetch.pending(), {
      result: results
    });
  }

  return fetch.done(results);
}

function invokeFetches(component) {
  var fetches = {};

  if (_.isFunction(component.fetch)) {
    var result = component.fetch.call(component);

    if (result._isFetchResult) {
      throw new Error('Cannot return a single fetch result. You must return an object ' + 'literal where the keys map to props and the values can be fetch results');
    }

    _.each(result, function (result, key) {
      if (!result || !result._isFetchResult) {
        result = fetch.done(result);
      }

      fetches[key] = result;
    });
  } else {
    _.each(component.fetch, function (getResult, key) {
      if (!_.isFunction(getResult)) {
        log.warn('The fetch ' + key + ' was not a function and so ignoring');
      } else {
        var result = getResult.call(component);

        if (!result || !result._isFetchResult) {
          result = fetch.done(result);
        }

        fetches[key] = result;
      }
    });
  }

  return fetches;
}

module.exports = getFetchResult;

},{"32":32,"63":63,"72":72}],20:[function(require,module,exports){
'use strict';

module.exports = function (marty, React) {
  marty.createContainer = require(18)(React);
};

},{"18":18}],21:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var _ = require(63);
var invariant = require(87);
var cookieFactory = defaultCookieFactory;
var StateSource = require(37);

var CookieStateSource = (function (_StateSource) {
  function CookieStateSource(options) {
    _classCallCheck(this, CookieStateSource);

    _get(Object.getPrototypeOf(CookieStateSource.prototype), 'constructor', this).call(this, options);
    this._isCookieStateSource = true;
    this._cookies = cookieFactory(this.app);
  }

  _inherits(CookieStateSource, _StateSource);

  _createClass(CookieStateSource, [{
    key: 'get',
    value: function get(key) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.get(key);
    }
  }, {
    key: 'set',
    value: function set(key, value, options) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.set(key, value, options);
    }
  }, {
    key: 'expire',
    value: function expire(key) {
      invariant(_.isString(key), 'key must be a string');

      return this._cookies.expire(key);
    }
  }], [{
    key: 'setCookieFactory',
    value: function setCookieFactory(value) {
      cookieFactory = value;
    }
  }]);

  return CookieStateSource;
})(StateSource);

function defaultCookieFactory() {
  return require(83);
}

module.exports = CookieStateSource;

},{"37":37,"63":63,"83":83,"87":87}],22:[function(require,module,exports){
'use strict';

var CookieStateSource = require(21);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'CookieStateSource', 'cookie', CookieStateSource);
};

},{"21":21,"35":35}],23:[function(require,module,exports){
'use strict';

var _ = require(63);
var uuid = require(43);

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addComponentHandler = addComponentHandler;
  this.timestamp = options.timestamp || new Date();

  Object.defineProperty(this, 'stores', {
    get: function get() {
      return stores;
    }
  });

  Object.defineProperty(this, 'components', {
    get: function get() {
      return components;
    }
  });

  function actionType(type) {
    if (_.isFunction(type)) {
      return type.toString();
    }

    return type;
  }

  function toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  function toJSON() {
    var json = _.pick(this, 'id', 'type', 'stores', 'arguments', 'timestamp', 'components');

    return json;
  }

  function handled() {
    _.each(actionHandledCallbacks, function (callback) {
      return callback();
    });
  }

  function onActionHandled(id, cb) {
    actionHandledCallbacks[id] = cb;
  }

  function addComponentHandler(component, store) {
    components.push(_.extend({
      id: uuid.small(),
      store: store.id || store.displayName
    }, component));
  }

  function addStoreHandler(store, handlerName) {
    stores.push({
      id: uuid.small(),
      handler: handlerName,
      store: store.id || store.displayName
    });
  }
}

module.exports = ActionPayload;

},{"43":43,"63":63}],24:[function(require,module,exports){
'use strict';

var findApp = require(30);

function appProperty(obj) {
  if (!obj.hasOwnProperty('app')) {
    Object.defineProperty(obj, 'app', {
      get: function get() {
        return findApp(this);
      }
    });
  }
}

module.exports = appProperty;

},{"30":30}],25:[function(require,module,exports){
'use strict';

var _ = require(63);

function createClass(properties, defaultOptions, BaseType) {
  function Class(options) {
    classCallCheck(this, Class);
    this.id = properties.id;
    this.displayName = properties.displayName;

    var base = get(Object.getPrototypeOf(Class.prototype), 'constructor', this);
    var baseOptions = _.extend({}, defaultOptions, options, properties);

    if (defaultOptions.dispatcher) {
      baseOptions.dispatcher = defaultOptions.dispatcher;
    }

    base.call(this, baseOptions);
  }

  if (BaseType) {
    inherits(Class, BaseType);
  }

  _.extend(Class.prototype, properties);

  Class.id = properties.id;
  Class.displayName = properties.displayName;

  return Class;
}

function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    desc = _parent = getter = undefined;
    _again = false;

    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var _parent = Object.getPrototypeOf(object);
      if (_parent === null) {
        return undefined;
      } else {
        _x = _parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        continue _function;
      }
    } else if ('value' in desc && desc.writable) {
      return desc.value;
    } else {
      var getter = desc.get;
      if (getter === undefined) {
        return undefined;
      }
      return getter.call(receiver);
    }
  }
}

function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (superClass) {
    subClass.__proto__ = superClass;
  }
}

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

module.exports = createClass;

},{"63":63}],26:[function(require,module,exports){
'use strict';

var _ = require(63);
var uuid = require(43);
var Dispatcher = require(84).Dispatcher;
var ActionPayload = require(23);
var EventEmitter = require(202);

var ACTION_DISPATCHED = 'ACTION_DISPATCHED';

function createDispatcher() {
  var emitter = new EventEmitter();
  var dispatcher = new Dispatcher();

  dispatcher.id = uuid.generate();
  dispatcher.isDefault = false;
  dispatcher.dispatchAction = function (options) {
    var action = new ActionPayload(options);

    this.dispatch(action);

    action.handled();
    emitter.emit(ACTION_DISPATCHED, action);

    return action;
  };

  dispatcher.onActionDispatched = function (callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(ACTION_DISPATCHED, callback);

    return {
      dispose: function dispose() {
        emitter.removeListener(ACTION_DISPATCHED, callback);
      }
    };
  };

  return dispatcher;
}

module.exports = createDispatcher;

},{"202":202,"23":23,"43":43,"63":63,"84":84}],27:[function(require,module,exports){
"use strict";

var diagnostics = {
  trace: trace,
  enabled: false,
  devtoolsEnabled: false };

module.exports = diagnostics;

function trace() {
  if (diagnostics.enabled) {
    console && console.log.apply(console, arguments);
  }
}

},{}],28:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var log = require(32);
var _ = require(63);
var uuid = require(43);
var warnings = require(44);
var Environment = require(29);

var DispatchCoordinator = (function () {
  function DispatchCoordinator(type, options) {
    _classCallCheck(this, DispatchCoordinator);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
    this.id = options.id;
    this.__isCoreType = true;
    this.__app = options.app;
    this.__id = uuid.type(this.__type);
  }

  _createClass(DispatchCoordinator, [{
    key: 'dispatch',
    value: function dispatch(type) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (_.isUndefined(type) || _.isNull(type)) {
        throw new Error('Must specify the action type');
      }

      return this.app.dispatcher.dispatchAction({
        type: type,
        arguments: args
      });
    }
  }, {
    key: 'app',
    get: function get() {
      return this.__app;
    }
  }]);

  return DispatchCoordinator;
})();

module.exports = DispatchCoordinator;

},{"29":29,"32":32,"43":43,"44":44,"63":63}],29:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],30:[function(require,module,exports){
"use strict";

function findApp(obj) {
  if (obj) {
    if (obj.context && obj.context.app) {
      return obj.context.app;
    }

    if (obj.props && obj.props.app) {
      return obj.props.app;
    }
  }
}

module.exports = findApp;

},{}],31:[function(require,module,exports){
'use strict';

var _ = require(63);
var logger = require(32);
var warnings = require(44);
var diagnostics = require(27);
var environment = require(29);
var StateSource = require(37);
var createStateSourceClass = require(36);

module.exports = function (marty) {
  marty.logger = logger;
  marty.warnings = warnings;
  marty.diagnostics = diagnostics;
  marty.StateSource = StateSource;
  marty.createStateSource = createStateSource;

  _.extend(marty, environment);

  function createStateSource(properties) {
    properties = properties || {};

    var BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    return createStateSourceClass(properties, BaseType);
  }
};

},{"27":27,"29":29,"32":32,"36":36,"37":37,"44":44,"63":63}],32:[function(require,module,exports){
'use strict';

var _ = require(63);
var Diagnostics = require(27);

if (console) {
  module.exports = console;
  module.exports.trace = function trace() {
    if (Diagnostics.enabled) {
      console.log.apply(console, arguments);
    }
  };
} else {
  module.exports = {
    log: _.noop,
    warn: _.noop,
    error: _.noop
  };
}

},{"27":27,"63":63}],33:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _ = require(63);

var Marty = function Marty(version, react) {
  _classCallCheck(this, Marty);

  this.version = version;
  this.stateSources = {};

  this.use = function use(cb) {
    if (!_.isFunction(cb)) {
      throw new Error('Must pass in a function');
    }

    cb(this, react);
  };
};

module.exports = Marty;

},{"63":63}],34:[function(require,module,exports){
'use strict';

var _ = require(63);

module.exports = {
  getItem: _.noop,
  setItem: _.noop
};

},{"63":63}],35:[function(require,module,exports){
"use strict";

function registerStateSource(marty, id, stateSourceId, clazz) {
  marty[id] = clazz;
  marty.stateSources[stateSourceId] = clazz;
}

module.exports = registerStateSource;

},{}],36:[function(require,module,exports){
'use strict';

var _ = require(63);
var createClass = require(25);

function createStateSourceClass(properties, baseType) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType);
}

module.exports = createStateSourceClass;

},{"25":25,"63":63}],37:[function(require,module,exports){
'use strict';

module.exports = require(38);

},{"38":38}],38:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var log = require(32);
var uuid = require(43);
var warnings = require(44);
var Environment = require(29);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.id = options.id;
    this.__app = options.app;
    this.__isCoreType = true;
    this.__type = 'StateSource';
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'app',
    get: function get() {
      return this.__app;
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"29":29,"32":32,"43":43,"44":44}],39:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var log = require(32);
var _ = require(63);

var StoreObserver = (function () {
  function StoreObserver(options) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    options = options || {};

    this.app = options.app;
    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    var stores = resolveStores(options);

    this.listeners = _.map(stores, function (store) {
      return _this.listenToStore(store);
    });
  }

  _createClass(StoreObserver, [{
    key: 'dispose',
    value: function dispose() {
      _.invoke(this.listeners, 'dispose');
    }
  }, {
    key: 'listenToStore',
    value: function listenToStore(store) {
      var _this2 = this;

      var component = this.component;
      var storeDisplayName = store.displayName || store.id;

      log.trace('The ' + component.displayName + ' component  (' + component.id + ') is listening to the ' + storeDisplayName + ' store');

      return store.addChangeListener(function (state, store) {
        var storeDisplayName = store.displayName || store.id;

        log.trace('' + storeDisplayName + ' store has changed. ' + ('The ' + _this2.component.displayName + ' component (' + _this2.component.id + ') is updating'));

        if (store && store.action) {
          store.action.addComponentHandler({
            displayName: _this2.component.displayName
          }, store);
        }

        _this2.onStoreChanged(store);
      });
    }
  }]);

  return StoreObserver;
})();

function resolveStores(options) {
  var app = options.app;
  var stores = options.stores;

  if (stores && !_.isArray(stores)) {
    stores = [stores];
  }

  return _.map(stores, function (storeId) {
    if (!_.isString(storeId)) {
      throw new Error('Store Id\'s must be strings. If you\'re migrating to v0.10 ' + 'you have probably forgotten to update listenTo');
    }

    if (!app) {
      throw new Error('Component not bound to an application');
    }

    if (!app[storeId]) {
      throw new Error('Could not find the store ' + storeId);
    }

    return app[storeId];
  });
}

module.exports = StoreObserver;

},{"32":32,"63":63}],40:[function(require,module,exports){
"use strict";

function deferred() {
  var result = {};
  result.promise = new Promise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

module.exports = deferred;

},{}],41:[function(require,module,exports){
'use strict';

var DEFAULT_CLASS_NAME = 'Class';

function getClassName(clazz) {
  var className = clazz.name || clazz.constructor && clazz.constructor.name;

  if (!className) {
    var funcNameRegex = /function (.{1,})\(/;
    var results = funcNameRegex.exec(clazz.toString());
    className = results && results.length > 1 ? results[1] : '';
  }

  return className === DEFAULT_CLASS_NAME ? null : className;
}

module.exports = getClassName;

},{}],42:[function(require,module,exports){
"use strict";

function timeout(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

module.exports = timeout;

},{}],43:[function(require,module,exports){
'use strict';

function generate() {
  return [s4(), s4(), '-', s4(), s4(), s4(), '-', s4(), s4(), s4()].join('');
}

function small() {
  return s4() + s4() + s4() + s4();
}

function type(instanceType) {
  return [instanceType, '-', s4(), s4(), s4(), s4()].join('');
}

function s4() {
  return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
}

module.exports = {
  type: type,
  small: small,
  generate: generate
};

},{}],44:[function(require,module,exports){
'use strict';

var _ = require(63);

var warnings = {
  without: without,
  reservedFunction: true,
  stateIsNullOrUndefined: true,
  superNotCalledWithOptions: true,
  fetchDoneRenamedFetchFailed: true,
  promiseNotReturnedFromRemotely: true
};

module.exports = warnings;

function without(warningsToDisable, cb, context) {
  if (!_.isArray(warningsToDisable)) {
    warningsToDisable = [warningsToDisable];
  }

  if (context) {
    cb = _.bind(cb, context);
  }

  try {
    _.each(warningsToDisable, function (warning) {
      warnings[warning] = false;
    });

    cb();
  } finally {
    _.each(warningsToDisable, function (warning) {
      warnings[warning] = true;
    });
  }
}

},{"63":63}],45:[function(require,module,exports){
'use strict';

function ActionHandlerNotFoundError(actionHandler, store) {
  this.name = 'Action handler not found';
  this.message = 'The action handler "' + actionHandler + '" could not be found';

  if (store) {
    var displayName = store.displayName || store.id;
    this.message += ' in the ' + displayName + ' store';
  }
}

ActionHandlerNotFoundError.prototype = Error.prototype;

module.exports = ActionHandlerNotFoundError;

},{}],46:[function(require,module,exports){
'use strict';

function ActionPredicateUndefinedError(actionHandler, store) {
  this.name = 'Action predicate undefined';
  this.message = 'The action predicate for "' + actionHandler + '" was undefined';

  if (store) {
    var displayName = store.displayName || store.id;
    this.message += ' in the ' + displayName + ' store';
  }
}

ActionPredicateUndefinedError.prototype = Error.prototype;

module.exports = ActionPredicateUndefinedError;

},{}],47:[function(require,module,exports){
'use strict';

function CompoundError(errors) {
  this.errors = errors;
  this.name = 'Compound error';
}

CompoundError.prototype = Error.prototype;

module.exports = CompoundError;

},{}],48:[function(require,module,exports){
'use strict';

function NotFoundError(message) {
  this.name = 'Not found';
  this.message = message || 'Not found';
  this.status = 404;
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;

},{}],49:[function(require,module,exports){
'use strict';

function UnkownStoreError(store) {
  this.name = 'Unknown store';
  this.message = 'Unknown store ' + store;
}

UnkownStoreError.prototype = Error.prototype;

module.exports = UnkownStoreError;

},{}],50:[function(require,module,exports){
'use strict';

module.exports = {
  id: 'includeCredentials',
  before: function before(req) {
    // Enable sending Cookies for authentication.
    // Ref: https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    req.credentials = 'same-origin';
  }
};

},{}],51:[function(require,module,exports){
'use strict';

module.exports = {
  parseJSON: require(52),
  throwOnError: require(54),
  stringifyJSON: require(53),
  includeCredentials: require(50)
};

},{"50":50,"52":52,"53":53,"54":54}],52:[function(require,module,exports){
'use strict';

var _ = require(63);
var log = require(32);
var warnings = require(44);

var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';

module.exports = {
  id: 'parseJSON',
  after: function after(res) {
    if (isJson(res)) {
      if (warnings.parseJSONDeprecated) {
        log.warn('Warning: The parseJSON HTTP hook is being deprecated ' + 'http://martyjs.org/guides/upgrading/09_10.html#parseJSON');
      }

      return res.json().then(function (body) {
        try {
          res.body = body;
        } catch (e) {
          if (e instanceof TypeError) {
            // Workaround for Chrome 43+ where Response.body is not settable.
            Object.defineProperty(res, 'body', { value: body });
          } else {
            throw e;
          }
        }

        return res;
      });
    }

    return res;
  }
};

function isJson(res) {
  var contentTypes = res.headers.get(CONTENT_TYPE);

  if (!_.isArray(contentTypes)) {
    if (contentTypes === undefined || contentTypes === null) {
      contentTypes = [];
    } else {
      contentTypes = [contentTypes];
    }
  }

  return _.any(contentTypes, function (contentType) {
    return contentType.indexOf(JSON_CONTENT_TYPE) !== -1;
  });
}

},{"32":32,"44":44,"63":63}],53:[function(require,module,exports){
'use strict';

var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';
var _ = require(63);

module.exports = {
  id: 'stringifyJSON',
  before: function before(req) {
    var contentType = req.headers[CONTENT_TYPE] || JSON_CONTENT_TYPE;

    if (typeof FormData !== 'undefined' && req.body instanceof FormData) {
      return;
    }

    if (contentType === JSON_CONTENT_TYPE && _.isObject(req.body)) {
      req.body = JSON.stringify(req.body);
      req.headers[CONTENT_TYPE] = JSON_CONTENT_TYPE;
    }
  }
};

},{"63":63}],54:[function(require,module,exports){
'use strict';

module.exports = {
  id: 'throwOnError',
  after: function after(res) {
    if (!res.ok) {
      throw res;
    }

    return res;
  }
};

},{}],55:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var hooks = {};
var log = require(32);
var _ = require(63);
var StateSource = require(37);
var accepts = {
  html: 'text/html',
  text: 'text/plain',
  json: 'application/json',
  xml: 'application/xml, text/xml',
  script: 'text/javascript, application/javascript, application/x-javascript' };

var HttpStateSource = (function (_StateSource) {
  function HttpStateSource(options) {
    _classCallCheck(this, HttpStateSource);

    _get(Object.getPrototypeOf(HttpStateSource.prototype), 'constructor', this).call(this, options);
    this._isHttpStateSource = true;
  }

  _inherits(HttpStateSource, _StateSource);

  _createClass(HttpStateSource, [{
    key: 'request',
    value: function request(req) {
      var _this = this;

      if (!req.headers) {
        req.headers = {};
      }

      beforeRequest(this, req);

      return fetch(req.url, req).then(function (res) {
        return afterRequest(_this, res);
      });
    }
  }, {
    key: 'get',
    value: function get(options) {
      return this.request(requestOptions('GET', this, options));
    }
  }, {
    key: 'put',
    value: function put(options) {
      return this.request(requestOptions('PUT', this, options));
    }
  }, {
    key: 'post',
    value: function post(options) {
      return this.request(requestOptions('POST', this, options));
    }
  }, {
    key: 'delete',
    value: function _delete(options) {
      return this.request(requestOptions('DELETE', this, options));
    }
  }, {
    key: 'patch',
    value: function patch(options) {
      return this.request(requestOptions('PATCH', this, options));
    }
  }], [{
    key: 'addHook',
    value: function addHook(hook) {
      if (!hook) {
        throw new Error('Must specify a hook');
      }

      if (_.isUndefined(hook.id)) {
        throw new Error('Hook must have an id');
      }

      if (_.isUndefined(hook.priority)) {
        hook.priority = Object.keys(hooks).length;
      }

      hooks[hook.id] = hook;
    }
  }, {
    key: 'removeHook',
    value: function removeHook(hook) {
      if (hook) {
        delete hooks[hook.id];
      }
    }
  }, {
    key: 'defaultBaseUrl',
    get: function get() {
      return '';
    }
  }]);

  return HttpStateSource;
})(StateSource);

HttpStateSource.addHook(require(52));
HttpStateSource.addHook(require(53));
HttpStateSource.addHook(require(50));

module.exports = HttpStateSource;

function requestOptions(method, source, options) {
  var baseUrl = source.baseUrl || HttpStateSource.defaultBaseUrl;

  if (_.isString(options)) {
    options = _.extend({
      url: options
    });
  }

  _.defaults(options, {
    headers: {}
  });

  options.method = method.toUpperCase();

  if (baseUrl) {
    var separator = '';
    var firstCharOfUrl = options.url[0];
    var lastCharOfBaseUrl = baseUrl[baseUrl.length - 1];

    // Do some text wrangling to make sure concatenation of base url
    // stupid people (i.e. me)
    if (lastCharOfBaseUrl !== '/' && firstCharOfUrl !== '/') {
      separator = '/';
    } else if (lastCharOfBaseUrl === '/' && firstCharOfUrl === '/') {
      options.url = options.url.substring(1);
    }

    options.url = baseUrl + separator + options.url;
  }

  if (options.contentType) {
    options.headers['Content-Type'] = options.contentType;
  }

  if (options.dataType) {
    var contentType = accepts[options.dataType];

    if (!contentType) {
      log.warn('Unknown data type ' + options.dataType);
    } else {
      options.headers['Accept'] = contentType;
    }
  }

  return options;
}

function beforeRequest(source, req) {
  _.each(getHooks('before'), function (hook) {
    try {
      hook.before.call(source, req);
    } catch (e) {
      log.error('Failed to execute hook before http request', e, hook);
      throw e;
    }
  });
}

function afterRequest(source, res) {
  var current = undefined;

  _.each(getHooks('after'), function (hook) {
    var execute = function execute(res) {
      try {
        return hook.after.call(source, res);
      } catch (e) {
        log.error('Failed to execute hook after http response', e, hook);
        throw e;
      }
    };

    if (current) {
      current = current.then(function (res) {
        return execute(res);
      });
    } else {
      current = execute(res);

      if (current && !_.isFunction(current.then)) {
        current = Promise.resolve(current);
      }
    }
  });

  return current || res;
}

function getHooks(func) {
  return _.sortBy(_.filter(hooks, has(func)), priority);

  function priority(hook) {
    return hook.priority;
  }

  function has(func) {
    return function (hook) {
      return hook && _.isFunction(hook[func]);
    };
  }
}

},{"32":32,"37":37,"50":50,"52":52,"53":53,"63":63}],56:[function(require,module,exports){
'use strict';

var HttpStateSource = require(55);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'HttpStateSource', 'http', HttpStateSource);

  marty.hooks = require(51);
};

},{"35":35,"51":51,"55":55}],57:[function(require,module,exports){
'use strict';

var JSONStorageStateSource = require(58);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'JSONStorageStateSource', 'jsonStorage', JSONStorageStateSource);
};

},{"35":35,"58":58}],58:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var noopStorage = require(34);
var StateSource = require(37);

var JSONStorageStateSource = (function (_StateSource) {
  function JSONStorageStateSource(options) {
    _classCallCheck(this, JSONStorageStateSource);

    _get(Object.getPrototypeOf(JSONStorageStateSource.prototype), 'constructor', this).call(this, options);
    this._isJSONStorageStateSource = true;

    if (!this.storage) {
      this.storage = JSONStorageStateSource.defaultStorage;
    }
  }

  _inherits(JSONStorageStateSource, _StateSource);

  _createClass(JSONStorageStateSource, [{
    key: 'get',
    value: function get(key) {
      var raw = getStorage(this).getItem(getNamespacedKey(this, key));

      if (!raw) {
        return raw;
      }

      try {
        var payload = JSON.parse(raw);
        return payload.value;
      } catch (e) {
        throw new Error('Unable to parse JSON from storage');
      }
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      // Wrap the value in an object so as to preserve it's type
      // during serialization.
      var payload = {
        value: value
      };
      var raw = JSON.stringify(payload);
      getStorage(this).setItem(getNamespacedKey(this, key), raw);
    }
  }], [{
    key: 'defaultNamespace',
    get: function get() {
      return '';
    }
  }, {
    key: 'defaultStorage',
    get: function get() {
      return typeof window === 'undefined' ? noopStorage : window.localStorage;
    }
  }]);

  return JSONStorageStateSource;
})(StateSource);

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || JSONStorageStateSource.defaultNamespace;
}

function getStorage(source) {
  return source.storage || JSONStorageStateSource.defaultStorage || noopStorage;
}

module.exports = JSONStorageStateSource;

},{"34":34,"37":37}],59:[function(require,module,exports){
'use strict';

var LocalStorageStateSource = require(60);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'LocalStorageStateSource', 'localStorage', LocalStorageStateSource);
};

},{"35":35,"60":60}],60:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var noopStorage = require(34);
var StateSource = require(37);

var LocalStorageStateSource = (function (_StateSource) {
  function LocalStorageStateSource(options) {
    _classCallCheck(this, LocalStorageStateSource);

    _get(Object.getPrototypeOf(LocalStorageStateSource.prototype), 'constructor', this).call(this, options);
    this._isLocalStorageStateSource = true;
    this.storage = typeof window === 'undefined' ? noopStorage : window.localStorage;
  }

  _inherits(LocalStorageStateSource, _StateSource);

  _createClass(LocalStorageStateSource, [{
    key: 'get',
    value: function get(key) {
      return this.storage.getItem(getNamespacedKey(this, key));
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      return this.storage.setItem(getNamespacedKey(this, key), value);
    }
  }], [{
    key: 'defaultNamespace',
    get: function get() {
      return '';
    }
  }]);

  return LocalStorageStateSource;
})(StateSource);

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || LocalStorageStateSource.defaultNamespace;
}

module.exports = LocalStorageStateSource;

},{"34":34,"37":37}],61:[function(require,module,exports){
'use strict';

var LocationStateSource = require(62);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'LocationStateSource', 'location', LocationStateSource);
};

},{"35":35,"62":62}],62:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var _ = require(63);
var StateSource = require(37);
var locationFactory = defaultLocationFactory;

var LocationStateSource = (function (_StateSource) {
  function LocationStateSource(options) {
    _classCallCheck(this, LocationStateSource);

    _get(Object.getPrototypeOf(LocationStateSource.prototype), 'constructor', this).call(this, options);
    this._isLocationStateSource = true;
  }

  _inherits(LocationStateSource, _StateSource);

  _createClass(LocationStateSource, [{
    key: 'getLocation',
    value: function getLocation(location) {
      return locationFactory(this.app, location);
    }
  }], [{
    key: 'setLocationFactory',
    value: function setLocationFactory(value) {
      locationFactory = value;
    }
  }]);

  return LocationStateSource;
})(StateSource);

module.exports = LocationStateSource;

function defaultLocationFactory(app, location) {
  var l = location || window.location;

  return {
    url: l.url,
    path: l.pathname,
    hostname: l.hostname,
    query: query(l.search),
    protocol: l.protocol.replace(':', '')
  };

  function query(search) {
    var result = {};

    _.each(search.substr(1).split('&'), function (part) {
      var item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    return result;
  }
}

},{"37":37,"63":63}],63:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(111),
  bind: require(144),
  defaults: require(187),
  each: require(99),
  extend: require(186),
  find: require(98),
  findKey: require(188),
  first: require(91),
  rest: require(94),
  has: require(190),
  initial: require(92),
  isArray: require(176),
  isEqual: require(177),
  isFunction: require(132),
  isNull: require(180),
  isObject: require(181),
  isString: require(182),
  isUndefined: require(184),
  last: require(93),
  map: require(101),
  noop: require(200),
  object: require(96),
  omit: require(193),
  pick: require(195),
  toArray: require(185),
  union: require(95),
  keys: require(191),
  values: require(196),
  once: require(104),
  filter: require(97),
  invoke: require(100),
  sortBy: require(102),
  functions: require(189),
  difference: require(88) };

},{"100":100,"101":101,"102":102,"104":104,"111":111,"132":132,"144":144,"176":176,"177":177,"180":180,"181":181,"182":182,"184":184,"185":185,"186":186,"187":187,"188":188,"189":189,"190":190,"191":191,"193":193,"195":195,"196":196,"200":200,"88":88,"91":91,"92":92,"93":93,"94":94,"95":95,"96":96,"97":97,"98":98,"99":99}],64:[function(require,module,exports){
'use strict';

var Queries = require(66);
var _ = require(63);
var createClass = require(25);

var RESERVED_KEYWORDS = ['dispatch'];

function createQueriesClass(properties) {
  properties = properties || {};
  _.extend.apply(_, [properties].concat(properties.mixins));
  _.each(RESERVED_KEYWORDS, function (keyword) {
    if (properties[keyword]) {
      throw new Error('' + keyword + ' is a reserved keyword');
    }
  });

  var classProperties = _.omit(properties, 'mixins', 'types');

  return createClass(classProperties, properties, Queries);
}

module.exports = createQueriesClass;

},{"25":25,"63":63,"66":66}],65:[function(require,module,exports){
'use strict';

module.exports = function (marty) {
  marty.Queries = require(66);
  marty.createQueries = require(64);
};

},{"64":64,"66":66}],66:[function(require,module,exports){
'use strict';

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var DispatchCoordinator = require(28);

var Queries = (function (_DispatchCoordinator) {
  function Queries(options) {
    _classCallCheck(this, Queries);

    _get(Object.getPrototypeOf(Queries.prototype), 'constructor', this).call(this, 'Queries', options);
  }

  _inherits(Queries, _DispatchCoordinator);

  return Queries;
})(DispatchCoordinator);

module.exports = Queries;

},{"28":28}],67:[function(require,module,exports){
'use strict';

var SessionStorageStateSource = require(68);
var registerStateSource = require(35);

module.exports = function (marty) {
  registerStateSource(marty, 'SessionStorageStateSource', 'sessionStorage', SessionStorageStateSource);
};

},{"35":35,"68":68}],68:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
}

var noopStorage = require(34);
var StateSource = require(37);

var SessionStorageStateSource = (function (_StateSource) {
  function SessionStorageStateSource(options) {
    _classCallCheck(this, SessionStorageStateSource);

    _get(Object.getPrototypeOf(SessionStorageStateSource.prototype), 'constructor', this).call(this, options);
    this._isSessionStorageStateSource = true;
    this.storage = typeof window === 'undefined' ? noopStorage : window.sessionStorage;
  }

  _inherits(SessionStorageStateSource, _StateSource);

  _createClass(SessionStorageStateSource, [{
    key: 'get',
    value: function get(key) {
      return this.storage.getItem(getNamespacedKey(this, key));
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      return this.storage.setItem(getNamespacedKey(this, key), value);
    }
  }], [{
    key: 'defaultNamespace',
    get: function get() {
      return '';
    }
  }]);

  return SessionStorageStateSource;
})(StateSource);

function getNamespacedKey(source, key) {
  return getNamespace(source) + key;
}

function getNamespace(source) {
  return source.namespace || SessionStorageStateSource.defaultNamespace;
}

module.exports = SessionStorageStateSource;

},{"34":34,"37":37}],69:[function(require,module,exports){
'use strict';

var _ = require(63);
var findApp = require(30);
var uuid = require(43);
var appProperty = require(24);
var StoreObserver = require(39);
var reservedKeys = ['listenTo', 'getState', 'getInitialState'];

module.exports = function (React) {
  return function createStateMixin(options) {
    options = options || {};

    var instanceMethods = _.omit(options, reservedKeys);

    var contextTypes = {
      app: React.PropTypes.object
    };

    var mixin = _.extend({
      contextTypes: contextTypes,
      childContextTypes: contextTypes,
      getChildContext: function getChildContext() {
        return { app: findApp(this) };
      },
      componentDidMount: function componentDidMount() {
        var component = {
          id: this.__id,
          displayName: this.displayName || this.constructor.displayName };

        this.__observer = new StoreObserver({
          app: this.app,
          component: component,
          stores: options.listenTo || [],
          onStoreChanged: this.onStoreChanged
        });
      },
      onStoreChanged: function onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount: function componentWillUnmount() {
        if (this.__observer) {
          this.__observer.dispose();
        }
      },
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var oldProps = this.props;
        this.props = nextProps;

        var newState = this.getState();

        this.props = oldProps;
        this.setState(newState);
      },
      getState: function getState() {
        return (options.getState || _.noop).call(this);
      },
      getInitialState: function getInitialState() {
        appProperty(this);

        var el = this._currentElement;

        if (!this.displayName && el && el.type) {
          this.displayName = el.type.displayName;
        }

        this.state = {};
        this.__id = uuid.type('Component');

        if (options.getInitialState) {
          this.state = options.getInitialState.call(this);
        }

        this.state = _.extend(this.state, this.getState());

        return this.state;
      }
    }, instanceMethods);

    return mixin;
  };
};

},{"24":24,"30":30,"39":39,"43":43,"63":63}],70:[function(require,module,exports){
'use strict';

module.exports = function (marty, React) {
  marty.createStateMixin = require(69)(React);
};

},{"69":69}],71:[function(require,module,exports){
'use strict';

var log = require(32);
var Store = require(78);
var _ = require(63);
var warnings = require(44);
var createClass = require(25);

var RESERVED_FUNCTIONS = ['getState'];
var VIRTUAL_FUNCTIONS = ['clear', 'dispose'];

function createStoreClass(properties) {
  properties = properties || {};
  validateStoreOptions(properties);
  addMixins(properties);

  var overrideFunctions = getOverrideFunctions(properties);
  var functionsToOmit = _.union(VIRTUAL_FUNCTIONS, RESERVED_FUNCTIONS);
  var classProperties = _.extend(_.omit(properties, functionsToOmit), overrideFunctions);

  return createClass(classProperties, classProperties, Store);
}

function getOverrideFunctions(properties) {
  var overrideFunctions = _.pick(properties, VIRTUAL_FUNCTIONS);

  _.each(_.functions(overrideFunctions), function (name) {
    var override = overrideFunctions[name];

    overrideFunctions[name] = function () {
      Store.prototype[name].call(this);
      override.call(this);
    };
  });

  return overrideFunctions;
}

function addMixins(properties) {
  var handlers = _.map(properties.mixins, function (mixin) {
    return mixin.handlers;
  });

  var mixins = _.map(properties.mixins, function (mixin) {
    return _.omit(mixin, 'handlers');
  });

  _.extend.apply(_, [properties].concat(mixins));
  _.extend.apply(_, [properties.handlers].concat(handlers));
}

function validateStoreOptions(properties) {
  var displayName = properties.displayName;

  _.each(RESERVED_FUNCTIONS, function (functionName) {
    if (properties[functionName]) {
      if (displayName) {
        functionName += ' in ' + displayName;
      }

      if (warnings.reservedFunction) {
        log.warn('Warning: ' + functionName + ' is reserved for use by Marty. Please use a different name');
      }
    }
  });
}

module.exports = createStoreClass;

},{"25":25,"32":32,"44":44,"63":63,"78":78}],72:[function(require,module,exports){
'use strict';

var when = require(82);
var NotFoundError = require(48);

module.exports = {
  done: done,
  failed: failed,
  pending: pending,
  notFound: notFound
};

function pending(id, store) {
  return fetchResult({
    id: id,
    pending: true,
    status: 'PENDING'
  }, store);
}

function failed(error, id, store) {
  return fetchResult({
    id: id,
    error: error,
    failed: true,
    status: 'FAILED'
  }, store);
}

function done(result, id, store) {
  return fetchResult({
    id: id,
    done: true,
    status: 'DONE',
    result: result
  }, store);
}

function notFound(id, store) {
  return failed(new NotFoundError(), id, store);
}

function fetchResult(initialResult, store) {
  initialResult.when = when;
  initialResult.toPromise = toPromise;
  initialResult._isFetchResult = true;

  if (store) {
    initialResult.store = store.displayName || store.id;
  }

  return initialResult;

  function toPromise() {
    return new Promise(function (resolve, reject) {
      var listener = undefined;

      if (!tryResolveFetch(initialResult) && store) {
        listener = store.addFetchChangedListener(tryResolveFetch);
      }

      function tryResolveFetch(latestResult) {
        if (latestResult.id !== initialResult.id) {
          return;
        }

        if (latestResult.done) {
          initialResult.done = true;
          initialResult.pending = false;
          initialResult.status = 'DONE';
          initialResult.result = latestResult.result;

          resolve(latestResult.result);
        } else if (latestResult.failed) {
          initialResult.failed = true;
          initialResult.pending = false;
          initialResult.status = 'FAILED';
          initialResult.error = latestResult.error;

          reject(latestResult.error);
        } else {
          return false;
        }

        if (listener) {
          listener.dispose();
        }

        return true;
      }
    });
  }
}

},{"48":48,"82":82}],73:[function(require,module,exports){
'use strict';

var constants = require(16);

module.exports = constants(['PENDING', 'FAILED', 'DONE', 'FETCH_FAILED']);

},{"16":16}],74:[function(require,module,exports){
'use strict';

var _require = require(63);

var extend = _require.extend;

function getHandlers(store) {
  return extend({}, store.handlers, store.constructor.handlers);
}

module.exports = getHandlers;

},{"63":63}],75:[function(require,module,exports){
'use strict';

var _ = require(63);
var getHandlers = require(74);

function handleAction(action) {
  this.__validateHandlers();

  var store = this;
  var handlers = _.object(_.map(getHandlers(store), getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        store.action = action;
        action.addStoreHandler(store, handlerName);
        store[handlerName].apply(store, action.arguments);
      }
    });
  });
}

function getHandlerWithPredicates(constants, handler) {
  _.isArray(constants) || (constants = [constants]);

  var predicates = _.map(constants, toPredicate);

  return [handler, predicates];

  function toPredicate(constant) {
    return function (action) {
      return action.type === constant;
    };
  }
}

module.exports = handleAction;

},{"63":63,"74":74}],76:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) {
  return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
}

var _require = require(63);

var toArray = _require.toArray;
var extend = _require.extend;

function handles() {
  var constants = toArray(arguments);

  return function (target, name, descriptor) {
    target.handlers = extend({}, target.handlers, _defineProperty({}, name, constants));

    return descriptor;
  };
}

module.exports = handles;

},{"63":63}],77:[function(require,module,exports){
'use strict';

module.exports = function (marty) {
  marty.when = require(82);
  marty.fetch = require(72);
  marty.Store = require(78);
  marty.handles = require(76);
  marty.createStore = require(71);
};

},{"71":71,"72":72,"76":76,"78":78,"82":82}],78:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var log = require(32);
var fetch = require(80);
var _ = require(63);
var uuid = require(43);
var warnings = require(44);
var StoreEvents = require(79);
var Environment = require(29);
var handleAction = require(75);
var EventEmitter = require(202);
var validateHandlers = require(81);

var Store = (function () {
  function Store(options) {
    var _this = this;

    _classCallCheck(this, Store);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    options = options || {};

    this.__state = {};
    this.id = options.id;
    this.__type = 'Store';
    this.__isStore = true;
    this.__app = options.app;
    this.__isCoreType = true;
    this.__fetchHistory = {};
    this.__failedFetches = {};
    this.__fetchInProgress = {};
    this.__id = uuid.type(this.__type);
    this.__emitter = new EventEmitter();
    this.__validateHandlers = _.once(function () {
      return validateHandlers(_this);
    });

    var initialState = this.getInitialState();

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = this.app.dispatcher.register(_.bind(this.handleAction, this));
  }

  _createClass(Store, [{
    key: 'app',
    get: function get() {
      return this.__app;
    }
  }, {
    key: 'state',
    get: function get() {
      return this.getState();
    },
    set: function set(newState) {
      this.replaceState(newState);
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this.__state;
    }
  }, {
    key: 'setState',
    value: function setState(state) {
      var newState = _.extend({}, this.state, state);

      this.replaceState(newState);
    }
  }, {
    key: 'replaceState',
    value: function replaceState(newState) {
      var currentState = this.__state;

      if (_.isUndefined(newState) || _.isNull(newState)) {
        if (warnings.stateIsNullOrUndefined) {
          var displayName = this.displayName || this.id;

          log.warn('Warning: Trying to replace the state of the store ' + displayName + ' with null or undefined');
        }
      }

      if (newState !== currentState) {
        this.__state = newState;
        this.hasChanged();
      }
    }
  }, {
    key: 'clear',
    value: function clear(newState) {
      this.__fetchHistory = {};
      this.__failedFetches = {};
      this.__fetchInProgress = {};

      if (!newState && _.isFunction(this.getInitialState)) {
        newState = this.getInitialState();
      }

      this.state = newState || {};
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      var emitter = this.__emitter;
      var dispatchToken = this.dispatchToken;

      emitter.removeAllListeners(StoreEvents.CHANGE_EVENT);
      emitter.removeAllListeners(StoreEvents.FETCH_CHANGE_EVENT);
      this.clear();

      if (dispatchToken) {
        this.app.dispatcher.unregister(dispatchToken);
        this.dispatchToken = undefined;
      }
    }
  }, {
    key: 'hasChanged',
    value: function hasChanged(eventArgs) {
      var _this2 = this;

      var emitChange = function emitChange() {
        var emitter = _this2.__emitter;

        emitter.emit.call(emitter, StoreEvents.CHANGE_EVENT, _this2.state, _this2, eventArgs);

        // Clear the action once the component has seen it
        _this2.action = null;
      };

      if (this.action) {
        this.action.onActionHandled(this.id, emitChange);
      } else {
        emitChange();
      }
    }
  }, {
    key: 'hasAlreadyFetched',
    value: function hasAlreadyFetched(fetchId) {
      return !!this.__fetchHistory[fetchId];
    }
  }, {
    key: 'addChangeListener',
    value: function addChangeListener(callback, context) {
      var _this3 = this;

      var emitter = this.__emitter;

      if (context) {
        callback = _.bind(callback, context);
      }

      log.trace('The ' + this.displayName + ' store (' + this.id + ') is adding a change listener');

      emitter.on(StoreEvents.CHANGE_EVENT, callback);

      return {
        dispose: function dispose() {
          log.trace('The ' + _this3.displayName + ' store (' + _this3.id + ') is disposing of a change listener');

          emitter.removeListener(StoreEvents.CHANGE_EVENT, callback);
        }
      };
    }
  }, {
    key: 'addFetchChangedListener',
    value: function addFetchChangedListener(callback, context) {
      var emitter = this.__emitter;

      if (context) {
        callback = _.bind(callback, context);
      }

      emitter.on(StoreEvents.FETCH_CHANGE_EVENT, callback);

      return {
        dispose: function dispose() {
          emitter.removeListener(StoreEvents.FETCH_CHANGE_EVENT, callback);
        }
      };
    }
  }, {
    key: 'waitFor',
    value: function waitFor(stores) {
      var dispatcher = this.app.dispatcher;

      if (!_.isArray(stores)) {
        stores = _.toArray(arguments);
      }

      dispatcher.waitFor(dispatchTokens(stores));

      function dispatchTokens(stores) {
        var tokens = [];

        _.each(stores, function (store) {
          if (store.dispatchToken) {
            tokens.push(store.dispatchToken);
          }

          if (_.isString(store)) {
            tokens.push(store);
          }
        });

        return tokens;
      }
    }
  }]);

  return Store;
})();

Store.prototype.fetch = fetch;
Store.prototype.handleAction = handleAction;

module.exports = Store;

},{"202":202,"29":29,"32":32,"43":43,"44":44,"63":63,"75":75,"79":79,"80":80,"81":81}],79:[function(require,module,exports){
'use strict';

module.exports = {
  CHANGE_EVENT: 'changed',
  FETCH_CHANGE_EVENT: 'fetch-changed'
};

},{}],80:[function(require,module,exports){
'use strict';

var log = require(32);
var _ = require(63);
var warnings = require(44);
var fetchResult = require(72);
var StoreEvents = require(79);
var CompoundError = require(47);
var NotFoundError = require(48);
var FetchConstants = require(73);

function fetch(id, local, remote) {
  var store = this;
  var app = this.app;
  var options = undefined,
      result = undefined,
      error = undefined,
      cacheError = undefined;

  if (_.isObject(id)) {
    options = id;
  } else {
    options = {
      id: id,
      locally: local,
      remotely: remote
    };
  }

  _.defaults(options, {
    locally: _.noop,
    remotely: _.noop
  });

  if (!options || _.isUndefined(options.id)) {
    throw new Error('must specify an id');
  }

  result = dependencyResult(this, options);

  if (result) {
    return result;
  }

  cacheError = _.isUndefined(options.cacheError) || options.cacheError;

  if (cacheError) {
    error = store.__failedFetches[options.id];

    if (error) {
      return fetchFailed(error);
    }
  }

  if (store.__fetchInProgress[options.id]) {
    return fetchResult.pending(options.id, store);
  }

  if (app && app.fetchStarted) {
    app.fetchStarted(store.id, options.id);
  }

  return tryAndGetLocally() || tryAndGetRemotely();

  function tryAndGetLocally(remoteCalled) {
    var result = options.locally.call(store);

    if (_.isUndefined(result)) {
      return;
    }

    if (_.isNull(result)) {
      return fetchNotFound();
    }

    if (!remoteCalled) {
      finished();
    }

    return fetchFinished(result);
  }

  function tryAndGetRemotely() {
    result = options.remotely.call(store);

    if (result) {
      if (_.isFunction(result.then)) {
        store.__fetchInProgress[options.id] = true;

        result.then(function () {
          store.__fetchHistory[options.id] = true;
          result = tryAndGetLocally(true);

          if (result) {
            fetchFinished();
            store.hasChanged();
          } else {
            fetchNotFound();
            store.hasChanged();
          }
        })['catch'](function (error) {
          fetchFailed(error);
          store.hasChanged();

          store.app.dispatcher.dispatchAction({
            type: FetchConstants.FETCH_FAILED,
            arguments: [error, options.id, store]
          });
        });

        return fetchPending();
      } else {
        store.__fetchHistory[options.id] = true;
        result = tryAndGetLocally(true);

        if (result) {
          return result;
        }
      }
    }

    if (warnings.promiseNotReturnedFromRemotely) {
      log.warn(promiseNotReturnedWarning());
    }

    return fetchNotFound();
  }

  function promiseNotReturnedWarning() {
    var inStore = '';
    if (store.displayName) {
      inStore = ' in ' + store.displayName;
    }

    return 'The remote fetch for \'' + options.id + '\' ' + inStore + ' ' + 'did not return a promise and the state was ' + 'not present after remotely finished executing. ' + 'This might be because you forgot to return a promise.';
  }

  function finished() {
    store.__fetchHistory[options.id] = true;

    delete store.__fetchInProgress[options.id];
  }

  function fetchPending() {
    return fetchResult.pending(options.id, store);
  }

  function fetchFinished(result) {
    finished();

    if (app && app.fetchFinished && result) {
      app.fetchFinished(store.id, options.id, 'DONE', {
        result: result
      });
    }

    return fetchChanged(fetchResult.done(result, options.id, store));
  }

  function fetchFailed(error) {
    if (cacheError) {
      store.__failedFetches[options.id] = error;
    }

    finished();

    if (app && app.fetchFinished) {
      app.fetchFinished(store.id, options.id, 'FAILED', {
        error: error
      });
    }

    return fetchChanged(fetchResult.failed(error, options.id, store));
  }

  function fetchNotFound() {
    return fetchFailed(new NotFoundError(), options.id, store);
  }

  function fetchChanged(fetch) {
    store.__emitter.emit(StoreEvents.FETCH_CHANGE_EVENT, fetch);
    return fetch;
  }
}

function dependencyResult(store, options) {
  var pending = false;
  var errors = [];
  var dependencies = options.dependsOn;

  if (!dependencies) {
    return;
  }

  if (!_.isArray(dependencies)) {
    dependencies = [dependencies];
  }

  _.each(dependencies, function (dependency) {
    switch (dependency.status) {
      case FetchConstants.PENDING.toString():
        pending = true;
        break;
      case FetchConstants.FAILED.toString():
        errors.push(dependency.error);
        break;
    }
  });

  if (errors.length) {
    var error = errors.length === 1 ? errors[0] : new CompoundError(errors);

    return fetchResult.failed(error, options.id, store);
  }

  if (pending) {
    // Wait for all dependencies to be done and then notify listeners
    Promise.all(_.invoke(dependencies, 'toPromise')).then(function () {
      store.fetch(options);
      store.hasChanged();
    })['catch'](function () {
      store.fetch(options);
      store.hasChanged();
    });

    return fetchResult.pending(options.id, store);
  }
}

fetch.done = fetchResult.done;
fetch.failed = fetchResult.failed;
fetch.pending = fetchResult.pending;
fetch.notFound = fetchResult.notFound;

module.exports = fetch;

},{"32":32,"44":44,"47":47,"48":48,"63":63,"72":72,"73":73,"79":79}],81:[function(require,module,exports){
'use strict';

var _ = require(63);
var getHandlers = require(74);
var ActionHandlerNotFoundError = require(45);
var ActionPredicateUndefinedError = require(46);

function validateHandlers(store) {
  _.each(getHandlers(store), function (actionPredicate, handlerName) {
    var actionHandler = store[handlerName];

    if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
      throw new ActionHandlerNotFoundError(handlerName, store);
    }

    if (!actionPredicate) {
      throw new ActionPredicateUndefinedError(handlerName, store);
    }
  });
}

module.exports = validateHandlers;

},{"45":45,"46":46,"63":63,"74":74}],82:[function(require,module,exports){
'use strict';

var _ = require(63);
var StatusConstants = require(73);

when.all = all;
when.join = join;

function when(handlers, parentContext) {
  handlers || (handlers = {});

  var handler = handlers[this.status.toLowerCase()];

  if (!handler) {
    throw new Error('Could not find a ' + this.status + ' handler');
  }

  if (parentContext) {
    WhenContext.prototype = parentContext;
  }

  switch (this.status) {
    case StatusConstants.PENDING:
      return handler.call(new WhenContext());
    case StatusConstants.FAILED:
      return handler.call(new WhenContext(), this.error);
    case StatusConstants.DONE:
      return handler.call(new WhenContext(), this.result);
    default:
      throw new Error('Unknown fetch result status');
  }

  function WhenContext() {
    _.extend(this, handlers);
  }
}

function join() {
  var parentContext = undefined;
  var handlers = _.last(arguments);
  var fetchResults = _.initial(arguments);

  if (!areHandlers(handlers) && areHandlers(_.last(fetchResults))) {
    parentContext = handlers;
    handlers = fetchResults.pop();
  }

  return all(fetchResults, handlers, parentContext);
}

function all(fetchResults, handlers, parentContext) {
  if (!fetchResults || !handlers) {
    throw new Error('No fetch results or handlers specified');
  }

  if (!_.isArray(fetchResults) || _.any(fetchResults, notFetchResult)) {
    throw new Error('Must specify a set of fetch results');
  }

  var context = {
    result: results(fetchResults),
    error: firstError(fetchResults),
    status: aggregateStatus(fetchResults)
  };

  return when.call(context, handlers, parentContext);
}

function areHandlers(obj) {
  return _.isFunction(obj.done);
}

function results(fetchResults) {
  return fetchResults.map(function (result) {
    return result.result;
  });
}

function firstError(fetchResults) {
  var failedResult = _.find(fetchResults, {
    status: StatusConstants.FAILED
  });

  if (failedResult) {
    return failedResult.error;
  }
}

function notFetchResult(result) {
  return !result._isFetchResult;
}

function aggregateStatus(fetchResults) {
  for (var i = fetchResults.length - 1; i >= 0; i--) {
    var _status = fetchResults[i].status;

    if (_status === StatusConstants.FAILED || _status === StatusConstants.PENDING) {
      return _status;
    }
  }

  return StatusConstants.DONE;
}

module.exports = when;
/* fetchResults, handlers */

},{"63":63,"73":73}],83:[function(require,module,exports){
/*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }

            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],84:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require(85)

},{"85":85}],85:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require(86);

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"86":86}],86:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],87:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],88:[function(require,module,exports){
var baseDifference = require(118),
    baseFlatten = require(123),
    isArrayLike = require(163),
    restParam = require(105);

/**
 * Creates an array excluding all values of the provided arrays using
 * [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The arrays of values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.difference([1, 2, 3], [4, 2]);
 * // => [1, 3]
 */
var difference = restParam(function(array, values) {
  return isArrayLike(array)
    ? baseDifference(array, baseFlatten(values, false, true))
    : [];
});

module.exports = difference;

},{"105":105,"118":118,"123":123,"163":163}],89:[function(require,module,exports){
var baseSlice = require(139),
    isIterateeCall = require(165);

/**
 * Creates a slice of `array` with `n` elements dropped from the beginning.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.drop([1, 2, 3]);
 * // => [2, 3]
 *
 * _.drop([1, 2, 3], 2);
 * // => [3]
 *
 * _.drop([1, 2, 3], 5);
 * // => []
 *
 * _.drop([1, 2, 3], 0);
 * // => [1, 2, 3]
 */
function drop(array, n, guard) {
  var length = array ? array.length : 0;
  if (!length) {
    return [];
  }
  if (guard ? isIterateeCall(array, n, guard) : n == null) {
    n = 1;
  }
  return baseSlice(array, n < 0 ? 0 : n);
}

module.exports = drop;

},{"139":139,"165":165}],90:[function(require,module,exports){
var baseSlice = require(139),
    isIterateeCall = require(165);

/**
 * Creates a slice of `array` with `n` elements dropped from the end.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.dropRight([1, 2, 3]);
 * // => [1, 2]
 *
 * _.dropRight([1, 2, 3], 2);
 * // => [1]
 *
 * _.dropRight([1, 2, 3], 5);
 * // => []
 *
 * _.dropRight([1, 2, 3], 0);
 * // => [1, 2, 3]
 */
function dropRight(array, n, guard) {
  var length = array ? array.length : 0;
  if (!length) {
    return [];
  }
  if (guard ? isIterateeCall(array, n, guard) : n == null) {
    n = 1;
  }
  n = length - (+n || 0);
  return baseSlice(array, 0, n < 0 ? 0 : n);
}

module.exports = dropRight;

},{"139":139,"165":165}],91:[function(require,module,exports){
/**
 * Gets the first element of `array`.
 *
 * @static
 * @memberOf _
 * @alias head
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the first element of `array`.
 * @example
 *
 * _.first([1, 2, 3]);
 * // => 1
 *
 * _.first([]);
 * // => undefined
 */
function first(array) {
  return array ? array[0] : undefined;
}

module.exports = first;

},{}],92:[function(require,module,exports){
var dropRight = require(90);

/**
 * Gets all but the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.initial([1, 2, 3]);
 * // => [1, 2]
 */
function initial(array) {
  return dropRight(array, 1);
}

module.exports = initial;

},{"90":90}],93:[function(require,module,exports){
/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

},{}],94:[function(require,module,exports){
var drop = require(89);

/**
 * Gets all but the first element of `array`.
 *
 * @static
 * @memberOf _
 * @alias tail
 * @category Array
 * @param {Array} array The array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.rest([1, 2, 3]);
 * // => [2, 3]
 */
function rest(array) {
  return drop(array, 1);
}

module.exports = rest;

},{"89":89}],95:[function(require,module,exports){
var baseFlatten = require(123),
    baseUniq = require(142),
    restParam = require(105);

/**
 * Creates an array of unique values, in order, of the provided arrays using
 * [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([1, 2], [4, 2], [2, 1]);
 * // => [1, 2, 4]
 */
var union = restParam(function(arrays) {
  return baseUniq(baseFlatten(arrays, false, true));
});

module.exports = union;

},{"105":105,"123":123,"142":142}],96:[function(require,module,exports){
var isArray = require(176);

/**
 * The inverse of `_.pairs`; this method returns an object composed from arrays
 * of property names and values. Provide either a single two dimensional array,
 * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
 * and one of corresponding values.
 *
 * @static
 * @memberOf _
 * @alias object
 * @category Array
 * @param {Array} props The property names.
 * @param {Array} [values=[]] The property values.
 * @returns {Object} Returns the new object.
 * @example
 *
 * _.zipObject([['fred', 30], ['barney', 40]]);
 * // => { 'fred': 30, 'barney': 40 }
 *
 * _.zipObject(['fred', 'barney'], [30, 40]);
 * // => { 'fred': 30, 'barney': 40 }
 */
function zipObject(props, values) {
  var index = -1,
      length = props ? props.length : 0,
      result = {};

  if (length && !values && !isArray(props[0])) {
    values = [];
  }
  while (++index < length) {
    var key = props[index];
    if (values) {
      result[key] = values[index];
    } else if (key) {
      result[key[0]] = key[1];
    }
  }
  return result;
}

module.exports = zipObject;

},{"176":176}],97:[function(require,module,exports){
var arrayFilter = require(109),
    baseCallback = require(115),
    baseFilter = require(120),
    isArray = require(176);

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
 * invoked with three arguments: (value, index|key, collection).
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @alias select
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Array} Returns the new filtered array.
 * @example
 *
 * _.filter([4, 5, 6], function(n) {
 *   return n % 2 == 0;
 * });
 * // => [4, 6]
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * // using the `_.matches` callback shorthand
 * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
 * // => ['barney']
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.pluck(_.filter(users, 'active', false), 'user');
 * // => ['fred']
 *
 * // using the `_.property` callback shorthand
 * _.pluck(_.filter(users, 'active'), 'user');
 * // => ['barney']
 */
function filter(collection, predicate, thisArg) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  predicate = baseCallback(predicate, thisArg, 3);
  return func(collection, predicate);
}

module.exports = filter;

},{"109":109,"115":115,"120":120,"176":176}],98:[function(require,module,exports){
var baseEach = require(119),
    createFind = require(152);

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
 * invoked with three arguments: (value, index|key, collection).
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @alias detect
 * @category Collection
 * @param {Array|Object|string} collection The collection to search.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.result(_.find(users, function(chr) {
 *   return chr.age < 40;
 * }), 'user');
 * // => 'barney'
 *
 * // using the `_.matches` callback shorthand
 * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
 * // => 'pebbles'
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.result(_.find(users, 'active', false), 'user');
 * // => 'fred'
 *
 * // using the `_.property` callback shorthand
 * _.result(_.find(users, 'active'), 'user');
 * // => 'barney'
 */
var find = createFind(baseEach);

module.exports = find;

},{"119":119,"152":152}],99:[function(require,module,exports){
var arrayEach = require(108),
    baseEach = require(119),
    createForEach = require(154);

/**
 * Iterates over elements of `collection` invoking `iteratee` for each element.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection). Iteratee functions may exit iteration early
 * by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length" property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2]).forEach(function(n) {
 *   console.log(n);
 * }).value();
 * // => logs each value from left to right and returns the array
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
 *   console.log(n, key);
 * });
 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
 */
var forEach = createForEach(arrayEach, baseEach);

module.exports = forEach;

},{"108":108,"119":119,"154":154}],100:[function(require,module,exports){
var baseEach = require(119),
    invokePath = require(162),
    isArrayLike = require(163),
    isKey = require(166),
    restParam = require(105);

/**
 * Invokes the method at `path` of each element in `collection`, returning
 * an array of the results of each invoked method. Any additional arguments
 * are provided to each invoked method. If `methodName` is a function it is
 * invoked for, and `this` bound to, each element in `collection`.
 *
 * @static
 * @memberOf _
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Array|Function|string} path The path of the method to invoke or
 *  the function invoked per iteration.
 * @param {...*} [args] The arguments to invoke the method with.
 * @returns {Array} Returns the array of results.
 * @example
 *
 * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
 * // => [[1, 5, 7], [1, 2, 3]]
 *
 * _.invoke([123, 456], String.prototype.split, '');
 * // => [['1', '2', '3'], ['4', '5', '6']]
 */
var invoke = restParam(function(collection, path, args) {
  var index = -1,
      isFunc = typeof path == 'function',
      isProp = isKey(path),
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value) {
    var func = isFunc ? path : ((isProp && value != null) ? value[path] : null);
    result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
  });
  return result;
});

module.exports = invoke;

},{"105":105,"119":119,"162":162,"163":163,"166":166}],101:[function(require,module,exports){
var arrayMap = require(110),
    baseCallback = require(115),
    baseMap = require(134),
    isArray = require(176);

/**
 * Creates an array of values by running each element in `collection` through
 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
 * arguments: (value, index|key, collection).
 *
 * If a property name is provided for `iteratee` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `iteratee` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
 * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
 * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
 * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
 * `sum`, `uniq`, and `words`
 *
 * @static
 * @memberOf _
 * @alias collect
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function timesThree(n) {
 *   return n * 3;
 * }
 *
 * _.map([1, 2], timesThree);
 * // => [3, 6]
 *
 * _.map({ 'a': 1, 'b': 2 }, timesThree);
 * // => [3, 6] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // using the `_.property` callback shorthand
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee, thisArg) {
  var func = isArray(collection) ? arrayMap : baseMap;
  iteratee = baseCallback(iteratee, thisArg, 3);
  return func(collection, iteratee);
}

module.exports = map;

},{"110":110,"115":115,"134":134,"176":176}],102:[function(require,module,exports){
var baseCallback = require(115),
    baseMap = require(134),
    baseSortBy = require(140),
    compareAscending = require(147),
    isIterateeCall = require(165);

/**
 * Creates an array of elements, sorted in ascending order by the results of
 * running each element in a collection through `iteratee`. This method performs
 * a stable sort, that is, it preserves the original sort order of equal elements.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection).
 *
 * If a property name is provided for `iteratee` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `iteratee` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array} Returns the new sorted array.
 * @example
 *
 * _.sortBy([1, 2, 3], function(n) {
 *   return Math.sin(n);
 * });
 * // => [3, 1, 2]
 *
 * _.sortBy([1, 2, 3], function(n) {
 *   return this.sin(n);
 * }, Math);
 * // => [3, 1, 2]
 *
 * var users = [
 *   { 'user': 'fred' },
 *   { 'user': 'pebbles' },
 *   { 'user': 'barney' }
 * ];
 *
 * // using the `_.property` callback shorthand
 * _.pluck(_.sortBy(users, 'user'), 'user');
 * // => ['barney', 'fred', 'pebbles']
 */
function sortBy(collection, iteratee, thisArg) {
  if (collection == null) {
    return [];
  }
  if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
    iteratee = null;
  }
  var index = -1;
  iteratee = baseCallback(iteratee, thisArg, 3);

  var result = baseMap(collection, function(value, key, collection) {
    return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
  });
  return baseSortBy(result, compareAscending);
}

module.exports = sortBy;

},{"115":115,"134":134,"140":140,"147":147,"165":165}],103:[function(require,module,exports){
/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it is called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery('#add').on('click', _.before(5, addContactToList));
 * // => allows adding up to 4 contacts to the list
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    if (typeof n == 'function') {
      var temp = n;
      n = func;
      func = temp;
    } else {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
  }
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = null;
    }
    return result;
  };
}

module.exports = before;

},{}],104:[function(require,module,exports){
var before = require(103);

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first call. The `func` is invoked
 * with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // `initialize` invokes `createApplication` once
 */
function once(func) {
  return before(2, func);
}

module.exports = once;

},{"103":103}],105:[function(require,module,exports){
/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],106:[function(require,module,exports){
var cachePush = require(146),
    getNative = require(160);

/** Native method references. */
var Set = getNative(global, 'Set');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = getNative(Object, 'create');

/**
 *
 * Creates a cache object to store unique values.
 *
 * @private
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var length = values ? values.length : 0;

  this.data = { 'hash': nativeCreate(null), 'set': new Set };
  while (length--) {
    this.push(values[length]);
  }
}

// Add functions to the `Set` cache.
SetCache.prototype.push = cachePush;

module.exports = SetCache;

},{"146":146,"160":160}],107:[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],108:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],109:[function(require,module,exports){
/**
 * A specialized version of `_.filter` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[++resIndex] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;

},{}],110:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],111:[function(require,module,exports){
/**
 * A specialized version of `_.some` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;

},{}],112:[function(require,module,exports){
/**
 * Used by `_.defaults` to customize its `_.assign` use.
 *
 * @private
 * @param {*} objectValue The destination object property value.
 * @param {*} sourceValue The source object property value.
 * @returns {*} Returns the value to assign to the destination object.
 */
function assignDefaults(objectValue, sourceValue) {
  return objectValue === undefined ? sourceValue : objectValue;
}

module.exports = assignDefaults;

},{}],113:[function(require,module,exports){
var keys = require(191);

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

module.exports = assignWith;

},{"191":191}],114:[function(require,module,exports){
var baseCopy = require(117),
    keys = require(191);

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"117":117,"191":191}],115:[function(require,module,exports){
var baseMatches = require(135),
    baseMatchesProperty = require(136),
    bindCallback = require(144),
    identity = require(199),
    property = require(201);

/**
 * The base implementation of `_.callback` which supports specifying the
 * number of arguments to provide to `func`.
 *
 * @private
 * @param {*} [func=_.identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function baseCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (type == 'function') {
    return thisArg === undefined
      ? func
      : bindCallback(func, thisArg, argCount);
  }
  if (func == null) {
    return identity;
  }
  if (type == 'object') {
    return baseMatches(func);
  }
  return thisArg === undefined
    ? property(func)
    : baseMatchesProperty(func, thisArg);
}

module.exports = baseCallback;

},{"135":135,"136":136,"144":144,"199":199,"201":201}],116:[function(require,module,exports){
/**
 * The base implementation of `compareAscending` which compares values and
 * sorts them in ascending order without guaranteeing a stable sort.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function baseCompareAscending(value, other) {
  if (value !== other) {
    var valIsNull = value === null,
        valIsUndef = value === undefined,
        valIsReflexive = value === value;

    var othIsNull = other === null,
        othIsUndef = other === undefined,
        othIsReflexive = other === other;

    if ((value > other && !othIsNull) || !valIsReflexive ||
        (valIsNull && !othIsUndef && othIsReflexive) ||
        (valIsUndef && othIsReflexive)) {
      return 1;
    }
    if ((value < other && !valIsNull) || !othIsReflexive ||
        (othIsNull && !valIsUndef && valIsReflexive) ||
        (othIsUndef && valIsReflexive)) {
      return -1;
    }
  }
  return 0;
}

module.exports = baseCompareAscending;

},{}],117:[function(require,module,exports){
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],118:[function(require,module,exports){
var baseIndexOf = require(129),
    cacheIndexOf = require(145),
    createCache = require(151);

/**
 * The base implementation of `_.difference` which accepts a single array
 * of values to exclude.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values) {
  var length = array ? array.length : 0,
      result = [];

  if (!length) {
    return result;
  }
  var index = -1,
      indexOf = baseIndexOf,
      isCommon = true,
      cache = (isCommon && values.length >= 200) ? createCache(values) : null,
      valuesLength = values.length;

  if (cache) {
    indexOf = cacheIndexOf;
    isCommon = false;
    values = cache;
  }
  outer:
  while (++index < length) {
    var value = array[index];

    if (isCommon && value === value) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === value) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (indexOf(values, value, 0) < 0) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;

},{"129":129,"145":145,"151":151}],119:[function(require,module,exports){
var baseForOwn = require(126),
    createBaseEach = require(149);

/**
 * The base implementation of `_.forEach` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object|string} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

},{"126":126,"149":149}],120:[function(require,module,exports){
var baseEach = require(119);

/**
 * The base implementation of `_.filter` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

module.exports = baseFilter;

},{"119":119}],121:[function(require,module,exports){
/**
 * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
 * without support for callback shorthands and `this` binding, which iterates
 * over `collection` using the provided `eachFunc`.
 *
 * @private
 * @param {Array|Object|string} collection The collection to search.
 * @param {Function} predicate The function invoked per iteration.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @param {boolean} [retKey] Specify returning the key of the found element
 *  instead of the element itself.
 * @returns {*} Returns the found element or its key, else `undefined`.
 */
function baseFind(collection, predicate, eachFunc, retKey) {
  var result;
  eachFunc(collection, function(value, key, collection) {
    if (predicate(value, key, collection)) {
      result = retKey ? key : value;
      return false;
    }
  });
  return result;
}

module.exports = baseFind;

},{}],122:[function(require,module,exports){
/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for callback shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {Function} predicate The function invoked per iteration.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromRight) {
  var length = array.length,
      index = fromRight ? length : -1;

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;

},{}],123:[function(require,module,exports){
var isArguments = require(175),
    isArray = require(176),
    isArrayLike = require(163),
    isObjectLike = require(168);

/**
 * The base implementation of `_.flatten` with added support for restricting
 * flattening and specifying the start index.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} [isDeep] Specify a deep flatten.
 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, isDeep, isStrict) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (isObjectLike(value) && isArrayLike(value) &&
        (isStrict || isArray(value) || isArguments(value))) {
      if (isDeep) {
        // Recursively flatten arrays (susceptible to call stack limits).
        value = baseFlatten(value, isDeep, isStrict);
      }
      var valIndex = -1,
          valLength = value.length;

      while (++valIndex < valLength) {
        result[++resIndex] = value[valIndex];
      }
    } else if (!isStrict) {
      result[++resIndex] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;

},{"163":163,"168":168,"175":175,"176":176}],124:[function(require,module,exports){
var createBaseFor = require(150);

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"150":150}],125:[function(require,module,exports){
var baseFor = require(124),
    keysIn = require(192);

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

module.exports = baseForIn;

},{"124":124,"192":192}],126:[function(require,module,exports){
var baseFor = require(124),
    keys = require(191);

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"124":124,"191":191}],127:[function(require,module,exports){
var isFunction = require(178);

/**
 * The base implementation of `_.functions` which creates an array of
 * `object` function property names filtered from those provided.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Array} props The property names to filter.
 * @returns {Array} Returns the new array of filtered property names.
 */
function baseFunctions(object, props) {
  var index = -1,
      length = props.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var key = props[index];
    if (isFunction(object[key])) {
      result[++resIndex] = key;
    }
  }
  return result;
}

module.exports = baseFunctions;

},{"178":178}],128:[function(require,module,exports){
var toObject = require(173);

/**
 * The base implementation of `get` without support for string paths
 * and default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path of the property to get.
 * @param {string} [pathKey] The key representation of path.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path, pathKey) {
  if (object == null) {
    return;
  }
  if (pathKey !== undefined && pathKey in toObject(object)) {
    path = [pathKey];
  }
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

},{"173":173}],129:[function(require,module,exports){
var indexOfNaN = require(161);

/**
 * The base implementation of `_.indexOf` without support for binary searches.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{"161":161}],130:[function(require,module,exports){
var baseIsEqualDeep = require(131),
    isObject = require(181);

/**
 * The base implementation of `_.isEqual` without support for `this` binding
 * `customizer` functions.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObject(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
}

module.exports = baseIsEqual;

},{"131":131,"181":181}],131:[function(require,module,exports){
var equalArrays = require(155),
    equalByTag = require(156),
    equalObjects = require(157),
    isArray = require(176),
    isTypedArray = require(183);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = objToString.call(object);
    if (objTag == argsTag) {
      objTag = objectTag;
    } else if (objTag != objectTag) {
      objIsArr = isTypedArray(object);
    }
  }
  if (!othIsArr) {
    othTag = objToString.call(other);
    if (othTag == argsTag) {
      othTag = objectTag;
    } else if (othTag != objectTag) {
      othIsArr = isTypedArray(other);
    }
  }
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (!isLoose) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
    }
  }
  if (!isSameTag) {
    return false;
  }
  // Assume cyclic values are equal.
  // For more information on detecting circular references see https://es5.github.io/#JO.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == object) {
      return stackB[length] == other;
    }
  }
  // Add `object` and `other` to the stack of traversed objects.
  stackA.push(object);
  stackB.push(other);

  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

  stackA.pop();
  stackB.pop();

  return result;
}

module.exports = baseIsEqualDeep;

},{"155":155,"156":156,"157":157,"176":176,"183":183}],132:[function(require,module,exports){
/**
 * The base implementation of `_.isFunction` without support for environments
 * with incorrect `typeof` results.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 */
function baseIsFunction(value) {
  // Avoid a Chakra JIT bug in compatibility modes of IE 11.
  // See https://github.com/jashkenas/underscore/issues/1621 for more details.
  return typeof value == 'function' || false;
}

module.exports = baseIsFunction;

},{}],133:[function(require,module,exports){
var baseIsEqual = require(130),
    toObject = require(173);

/**
 * The base implementation of `_.isMatch` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Array} matchData The propery names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = toObject(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;

},{"130":130,"173":173}],134:[function(require,module,exports){
var baseEach = require(119),
    isArrayLike = require(163);

/**
 * The base implementation of `_.map` without support for callback shorthands
 * and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

module.exports = baseMap;

},{"119":119,"163":163}],135:[function(require,module,exports){
var baseIsMatch = require(133),
    getMatchData = require(159),
    toObject = require(173);

/**
 * The base implementation of `_.matches` which does not clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    var key = matchData[0][0],
        value = matchData[0][1];

    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === value && (value !== undefined || (key in toObject(object)));
    };
  }
  return function(object) {
    return baseIsMatch(object, matchData);
  };
}

module.exports = baseMatches;

},{"133":133,"159":159,"173":173}],136:[function(require,module,exports){
var baseGet = require(128),
    baseIsEqual = require(130),
    baseSlice = require(139),
    isArray = require(176),
    isKey = require(166),
    isStrictComparable = require(169),
    last = require(93),
    toObject = require(173),
    toPath = require(174);

/**
 * The base implementation of `_.matchesProperty` which does not which does
 * not clone `value`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to compare.
 * @returns {Function} Returns the new function.
 */
function baseMatchesProperty(path, srcValue) {
  var isArr = isArray(path),
      isCommon = isKey(path) && isStrictComparable(srcValue),
      pathKey = (path + '');

  path = toPath(path);
  return function(object) {
    if (object == null) {
      return false;
    }
    var key = pathKey;
    object = toObject(object);
    if ((isArr || !isCommon) && !(key in object)) {
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      if (object == null) {
        return false;
      }
      key = last(path);
      object = toObject(object);
    }
    return object[key] === srcValue
      ? (srcValue !== undefined || (key in object))
      : baseIsEqual(srcValue, object[key], undefined, true);
  };
}

module.exports = baseMatchesProperty;

},{"128":128,"130":130,"139":139,"166":166,"169":169,"173":173,"174":174,"176":176,"93":93}],137:[function(require,module,exports){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],138:[function(require,module,exports){
var baseGet = require(128),
    toPath = require(174);

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 */
function basePropertyDeep(path) {
  var pathKey = (path + '');
  path = toPath(path);
  return function(object) {
    return baseGet(object, path, pathKey);
  };
}

module.exports = basePropertyDeep;

},{"128":128,"174":174}],139:[function(require,module,exports){
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  start = start == null ? 0 : (+start || 0);
  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = (end === undefined || end > length) ? length : (+end || 0);
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;

},{}],140:[function(require,module,exports){
/**
 * The base implementation of `_.sortBy` which uses `comparer` to define
 * the sort order of `array` and replaces criteria objects with their
 * corresponding values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  var length = array.length;

  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

module.exports = baseSortBy;

},{}],141:[function(require,module,exports){
/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

},{}],142:[function(require,module,exports){
var baseIndexOf = require(129),
    cacheIndexOf = require(145),
    createCache = require(151);

/**
 * The base implementation of `_.uniq` without support for callback shorthands
 * and `this` binding.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The function invoked per iteration.
 * @returns {Array} Returns the new duplicate-value-free array.
 */
function baseUniq(array, iteratee) {
  var index = -1,
      indexOf = baseIndexOf,
      length = array.length,
      isCommon = true,
      isLarge = isCommon && length >= 200,
      seen = isLarge ? createCache() : null,
      result = [];

  if (seen) {
    indexOf = cacheIndexOf;
    isCommon = false;
  } else {
    isLarge = false;
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value, index, array) : value;

    if (isCommon && value === value) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (indexOf(seen, computed, 0) < 0) {
      if (iteratee || isLarge) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;

},{"129":129,"145":145,"151":151}],143:[function(require,module,exports){
/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  var index = -1,
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = baseValues;

},{}],144:[function(require,module,exports){
var identity = require(199);

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

module.exports = bindCallback;

},{"199":199}],145:[function(require,module,exports){
var isObject = require(181);

/**
 * Checks if `value` is in `cache` mimicking the return signature of
 * `_.indexOf` by returning `0` if the value is found, else `-1`.
 *
 * @private
 * @param {Object} cache The cache to search.
 * @param {*} value The value to search for.
 * @returns {number} Returns `0` if `value` is found, else `-1`.
 */
function cacheIndexOf(cache, value) {
  var data = cache.data,
      result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

  return result ? 0 : -1;
}

module.exports = cacheIndexOf;

},{"181":181}],146:[function(require,module,exports){
var isObject = require(181);

/**
 * Adds `value` to the cache.
 *
 * @private
 * @name push
 * @memberOf SetCache
 * @param {*} value The value to cache.
 */
function cachePush(value) {
  var data = this.data;
  if (typeof value == 'string' || isObject(value)) {
    data.set.add(value);
  } else {
    data.hash[value] = true;
  }
}

module.exports = cachePush;

},{"181":181}],147:[function(require,module,exports){
var baseCompareAscending = require(116);

/**
 * Used by `_.sortBy` to compare transformed elements of a collection and stable
 * sort them in ascending order.
 *
 * @private
 * @param {Object} object The object to compare to `other`.
 * @param {Object} other The object to compare to `object`.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareAscending(object, other) {
  return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
}

module.exports = compareAscending;

},{"116":116}],148:[function(require,module,exports){
var bindCallback = require(144),
    isIterateeCall = require(165),
    restParam = require(105);

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"105":105,"144":144,"165":165}],149:[function(require,module,exports){
var getLength = require(158),
    isLength = require(167),
    toObject = require(173);

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      return eachFunc(collection, iteratee);
    }
    var index = fromRight ? length : -1,
        iterable = toObject(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

},{"158":158,"167":167,"173":173}],150:[function(require,module,exports){
var toObject = require(173);

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{"173":173}],151:[function(require,module,exports){
var SetCache = require(106),
    constant = require(198),
    getNative = require(160);

/** Native method references. */
var Set = getNative(global, 'Set');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = getNative(Object, 'create');

/**
 * Creates a `Set` cache object to optimize linear searches of large arrays.
 *
 * @private
 * @param {Array} [values] The values to cache.
 * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
 */
var createCache = !(nativeCreate && Set) ? constant(null) : function(values) {
  return new SetCache(values);
};

module.exports = createCache;

},{"106":106,"160":160,"198":198}],152:[function(require,module,exports){
var baseCallback = require(115),
    baseFind = require(121),
    baseFindIndex = require(122),
    isArray = require(176);

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new find function.
 */
function createFind(eachFunc, fromRight) {
  return function(collection, predicate, thisArg) {
    predicate = baseCallback(predicate, thisArg, 3);
    if (isArray(collection)) {
      var index = baseFindIndex(collection, predicate, fromRight);
      return index > -1 ? collection[index] : undefined;
    }
    return baseFind(collection, predicate, eachFunc);
  };
}

module.exports = createFind;

},{"115":115,"121":121,"122":122,"176":176}],153:[function(require,module,exports){
var baseCallback = require(115),
    baseFind = require(121);

/**
 * Creates a `_.findKey` or `_.findLastKey` function.
 *
 * @private
 * @param {Function} objectFunc The function to iterate over an object.
 * @returns {Function} Returns the new find function.
 */
function createFindKey(objectFunc) {
  return function(object, predicate, thisArg) {
    predicate = baseCallback(predicate, thisArg, 3);
    return baseFind(object, predicate, objectFunc, true);
  };
}

module.exports = createFindKey;

},{"115":115,"121":121}],154:[function(require,module,exports){
var bindCallback = require(144),
    isArray = require(176);

/**
 * Creates a function for `_.forEach` or `_.forEachRight`.
 *
 * @private
 * @param {Function} arrayFunc The function to iterate over an array.
 * @param {Function} eachFunc The function to iterate over a collection.
 * @returns {Function} Returns the new each function.
 */
function createForEach(arrayFunc, eachFunc) {
  return function(collection, iteratee, thisArg) {
    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
      ? arrayFunc(collection, iteratee)
      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
  };
}

module.exports = createForEach;

},{"144":144,"176":176}],155:[function(require,module,exports){
var arraySome = require(111);

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing arrays.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var index = -1,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index],
        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

    if (result !== undefined) {
      if (result) {
        continue;
      }
      return false;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (isLoose) {
      if (!arraySome(other, function(othValue) {
            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          })) {
        return false;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
      return false;
    }
  }
  return true;
}

module.exports = equalArrays;

},{"111":111}],156:[function(require,module,exports){
/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} value The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag) {
  switch (tag) {
    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object)
        ? other != +other
        : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings primitives and string
      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
      return object == (other + '');
  }
  return false;
}

module.exports = equalByTag;

},{}],157:[function(require,module,exports){
var keys = require(191);

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isLoose) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  var skipCtor = isLoose;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key],
        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

    // Recursively compare objects (susceptible to call stack limits).
    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
      return false;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (!skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      return false;
    }
  }
  return true;
}

module.exports = equalObjects;

},{"191":191}],158:[function(require,module,exports){
var baseProperty = require(137);

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

},{"137":137}],159:[function(require,module,exports){
var isStrictComparable = require(169),
    pairs = require(194);

/**
 * Gets the propery names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = pairs(object),
      length = result.length;

  while (length--) {
    result[length][2] = isStrictComparable(result[length][1]);
  }
  return result;
}

module.exports = getMatchData;

},{"169":169,"194":194}],160:[function(require,module,exports){
var isNative = require(179);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"179":179}],161:[function(require,module,exports){
/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 0 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = indexOfNaN;

},{}],162:[function(require,module,exports){
var baseGet = require(128),
    baseSlice = require(139),
    isKey = require(166),
    last = require(93),
    toPath = require(174);

/**
 * Invokes the method at `path` on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the method to invoke.
 * @param {Array} args The arguments to invoke the method with.
 * @returns {*} Returns the result of the invoked method.
 */
function invokePath(object, path, args) {
  if (object != null && !isKey(path, object)) {
    path = toPath(path);
    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
    path = last(path);
  }
  var func = object == null ? object : object[path];
  return func == null ? undefined : func.apply(object, args);
}

module.exports = invokePath;

},{"128":128,"139":139,"166":166,"174":174,"93":93}],163:[function(require,module,exports){
var getLength = require(158),
    isLength = require(167);

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

module.exports = isArrayLike;

},{"158":158,"167":167}],164:[function(require,module,exports){
/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = typeof value == 'number' ? value : parseFloat(value);
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

},{}],165:[function(require,module,exports){
var isArrayLike = require(163),
    isIndex = require(164),
    isObject = require(181);

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

module.exports = isIterateeCall;

},{"163":163,"164":164,"181":181}],166:[function(require,module,exports){
var isArray = require(176),
    toObject = require(173);

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

module.exports = isKey;

},{"173":173,"176":176}],167:[function(require,module,exports){
/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],168:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],169:[function(require,module,exports){
var isObject = require(181);

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

},{"181":181}],170:[function(require,module,exports){
var toObject = require(173);

/**
 * A specialized version of `_.pick` which picks `object` properties specified
 * by `props`.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property names to pick.
 * @returns {Object} Returns the new object.
 */
function pickByArray(object, props) {
  object = toObject(object);

  var index = -1,
      length = props.length,
      result = {};

  while (++index < length) {
    var key = props[index];
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

module.exports = pickByArray;

},{"173":173}],171:[function(require,module,exports){
var baseForIn = require(125);

/**
 * A specialized version of `_.pick` which picks `object` properties `predicate`
 * returns truthy for.
 *
 * @private
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Object} Returns the new object.
 */
function pickByCallback(object, predicate) {
  var result = {};
  baseForIn(object, function(value, key, object) {
    if (predicate(value, key, object)) {
      result[key] = value;
    }
  });
  return result;
}

module.exports = pickByCallback;

},{"125":125}],172:[function(require,module,exports){
var isArguments = require(175),
    isArray = require(176),
    isIndex = require(164),
    isLength = require(167),
    keysIn = require(192);

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = shimKeys;

},{"164":164,"167":167,"175":175,"176":176,"192":192}],173:[function(require,module,exports){
var isObject = require(181);

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

},{"181":181}],174:[function(require,module,exports){
var baseToString = require(141),
    isArray = require(176);

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `value` to property path array if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Array} Returns the property path array.
 */
function toPath(value) {
  if (isArray(value)) {
    return value;
  }
  var result = [];
  baseToString(value).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
}

module.exports = toPath;

},{"141":141,"176":176}],175:[function(require,module,exports){
var isArrayLike = require(163),
    isObjectLike = require(168);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) && objToString.call(value) == argsTag;
}

module.exports = isArguments;

},{"163":163,"168":168}],176:[function(require,module,exports){
var getNative = require(160),
    isLength = require(167),
    isObjectLike = require(168);

/** `Object#toString` result references. */
var arrayTag = '[object Array]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

module.exports = isArray;

},{"160":160,"167":167,"168":168}],177:[function(require,module,exports){
var baseIsEqual = require(130),
    bindCallback = require(144);

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent. If `customizer` is provided it is invoked to compare values.
 * If `customizer` returns `undefined` comparisons are handled by the method
 * instead. The `customizer` is bound to `thisArg` and invoked with three
 * arguments: (value, other [, index|key]).
 *
 * **Note:** This method supports comparing arrays, booleans, `Date` objects,
 * numbers, `Object` objects, regexes, and strings. Objects are compared by
 * their own, not inherited, enumerable properties. Functions and DOM nodes
 * are **not** supported. Provide a customizer function to extend support
 * for comparing other values.
 *
 * @static
 * @memberOf _
 * @alias eq
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize value comparisons.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * object == other;
 * // => false
 *
 * _.isEqual(object, other);
 * // => true
 *
 * // using a customizer callback
 * var array = ['hello', 'goodbye'];
 * var other = ['hi', 'goodbye'];
 *
 * _.isEqual(array, other, function(value, other) {
 *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
 *     return true;
 *   }
 * });
 * // => true
 */
function isEqual(value, other, customizer, thisArg) {
  customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
  var result = customizer ? customizer(value, other) : undefined;
  return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
}

module.exports = isEqual;

},{"130":130,"144":144}],178:[function(require,module,exports){
var baseIsFunction = require(132),
    getNative = require(160);

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Native method references. */
var Uint8Array = getNative(global, 'Uint8Array');

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return objToString.call(value) == funcTag;
};

module.exports = isFunction;

},{"132":132,"160":160}],179:[function(require,module,exports){
var escapeRegExp = require(197),
    isObjectLike = require(168);

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  escapeRegExp(fnToString.call(hasOwnProperty))
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"168":168,"197":197}],180:[function(require,module,exports){
/**
 * Checks if `value` is `null`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * _.isNull(null);
 * // => true
 *
 * _.isNull(void 0);
 * // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;

},{}],181:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],182:[function(require,module,exports){
var isObjectLike = require(168);

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
}

module.exports = isString;

},{"168":168}],183:[function(require,module,exports){
var isLength = require(167),
    isObjectLike = require(168);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

module.exports = isTypedArray;

},{"167":167,"168":168}],184:[function(require,module,exports){
/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 *
 * _.isUndefined(null);
 * // => false
 */
function isUndefined(value) {
  return value === undefined;
}

module.exports = isUndefined;

},{}],185:[function(require,module,exports){
var arrayCopy = require(107),
    getLength = require(158),
    isLength = require(167),
    values = require(196);

/**
 * Converts `value` to an array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * (function() {
 *   return _.toArray(arguments).slice(1);
 * }(1, 2, 3));
 * // => [2, 3]
 */
function toArray(value) {
  var length = value ? getLength(value) : 0;
  if (!isLength(length)) {
    return values(value);
  }
  if (!length) {
    return [];
  }
  return arrayCopy(value);
}

module.exports = toArray;

},{"107":107,"158":158,"167":167,"196":196}],186:[function(require,module,exports){
var assignWith = require(113),
    baseAssign = require(114),
    createAssigner = require(148);

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

},{"113":113,"114":114,"148":148}],187:[function(require,module,exports){
var assign = require(186),
    assignDefaults = require(112),
    restParam = require(105);

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object for all destination properties that resolve to `undefined`. Once a
 * property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var defaults = restParam(function(args) {
  var object = args[0];
  if (object == null) {
    return object;
  }
  args.push(assignDefaults);
  return assign.apply(undefined, args);
});

module.exports = defaults;

},{"105":105,"112":112,"186":186}],188:[function(require,module,exports){
var baseForOwn = require(126),
    createFindKey = require(153);

/**
 * This method is like `_.find` except that it returns the key of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to search.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
 * @example
 *
 * var users = {
 *   'barney':  { 'age': 36, 'active': true },
 *   'fred':    { 'age': 40, 'active': false },
 *   'pebbles': { 'age': 1,  'active': true }
 * };
 *
 * _.findKey(users, function(chr) {
 *   return chr.age < 40;
 * });
 * // => 'barney' (iteration order is not guaranteed)
 *
 * // using the `_.matches` callback shorthand
 * _.findKey(users, { 'age': 1, 'active': true });
 * // => 'pebbles'
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.findKey(users, 'active', false);
 * // => 'fred'
 *
 * // using the `_.property` callback shorthand
 * _.findKey(users, 'active');
 * // => 'barney'
 */
var findKey = createFindKey(baseForOwn);

module.exports = findKey;

},{"126":126,"153":153}],189:[function(require,module,exports){
var baseFunctions = require(127),
    keysIn = require(192);

/**
 * Creates an array of function property names from all enumerable properties,
 * own and inherited, of `object`.
 *
 * @static
 * @memberOf _
 * @alias methods
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the new array of property names.
 * @example
 *
 * _.functions(_);
 * // => ['after', 'ary', 'assign', ...]
 */
function functions(object) {
  return baseFunctions(object, keysIn(object));
}

module.exports = functions;

},{"127":127,"192":192}],190:[function(require,module,exports){
var baseGet = require(128),
    baseSlice = require(139),
    isArguments = require(175),
    isArray = require(176),
    isIndex = require(164),
    isKey = require(166),
    isLength = require(167),
    last = require(93),
    toPath = require(174);

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `path` is a direct property.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': { 'c': 3 } } };
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b.c');
 * // => true
 *
 * _.has(object, ['a', 'b', 'c']);
 * // => true
 */
function has(object, path) {
  if (object == null) {
    return false;
  }
  var result = hasOwnProperty.call(object, path);
  if (!result && !isKey(path)) {
    path = toPath(path);
    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
    if (object == null) {
      return false;
    }
    path = last(path);
    result = hasOwnProperty.call(object, path);
  }
  return result || (isLength(object.length) && isIndex(path, object.length) &&
    (isArray(object) || isArguments(object)));
}

module.exports = has;

},{"128":128,"139":139,"164":164,"166":166,"167":167,"174":174,"175":175,"176":176,"93":93}],191:[function(require,module,exports){
var getNative = require(160),
    isArrayLike = require(163),
    isObject = require(181),
    shimKeys = require(172);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? null : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

},{"160":160,"163":163,"172":172,"181":181}],192:[function(require,module,exports){
var isArguments = require(175),
    isArray = require(176),
    isIndex = require(164),
    isLength = require(167),
    isObject = require(181);

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"164":164,"167":167,"175":175,"176":176,"181":181}],193:[function(require,module,exports){
var arrayMap = require(110),
    baseDifference = require(118),
    baseFlatten = require(123),
    bindCallback = require(144),
    keysIn = require(192),
    pickByArray = require(170),
    pickByCallback = require(171),
    restParam = require(105);

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable properties of `object` that are not omitted.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {Function|...(string|string[])} [predicate] The function invoked per
 *  iteration or property names to omit, specified as individual property
 *  names or arrays of property names.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'user': 'fred', 'age': 40 };
 *
 * _.omit(object, 'age');
 * // => { 'user': 'fred' }
 *
 * _.omit(object, _.isNumber);
 * // => { 'user': 'fred' }
 */
var omit = restParam(function(object, props) {
  if (object == null) {
    return {};
  }
  if (typeof props[0] != 'function') {
    var props = arrayMap(baseFlatten(props), String);
    return pickByArray(object, baseDifference(keysIn(object), props));
  }
  var predicate = bindCallback(props[0], props[1], 3);
  return pickByCallback(object, function(value, key, object) {
    return !predicate(value, key, object);
  });
});

module.exports = omit;

},{"105":105,"110":110,"118":118,"123":123,"144":144,"170":170,"171":171,"192":192}],194:[function(require,module,exports){
var keys = require(191),
    toObject = require(173);

/**
 * Creates a two dimensional array of the key-value pairs for `object`,
 * e.g. `[[key1, value1], [key2, value2]]`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the new array of key-value pairs.
 * @example
 *
 * _.pairs({ 'barney': 36, 'fred': 40 });
 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
 */
function pairs(object) {
  object = toObject(object);

  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    var key = props[index];
    result[index] = [key, object[key]];
  }
  return result;
}

module.exports = pairs;

},{"173":173,"191":191}],195:[function(require,module,exports){
var baseFlatten = require(123),
    bindCallback = require(144),
    pickByArray = require(170),
    pickByCallback = require(171),
    restParam = require(105);

/**
 * Creates an object composed of the picked `object` properties. Property
 * names may be specified as individual arguments or as arrays of property
 * names. If `predicate` is provided it is invoked for each property of `object`
 * picking the properties `predicate` returns truthy for. The predicate is
 * bound to `thisArg` and invoked with three arguments: (value, key, object).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {Function|...(string|string[])} [predicate] The function invoked per
 *  iteration or property names to pick, specified as individual property
 *  names or arrays of property names.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'user': 'fred', 'age': 40 };
 *
 * _.pick(object, 'user');
 * // => { 'user': 'fred' }
 *
 * _.pick(object, _.isString);
 * // => { 'user': 'fred' }
 */
var pick = restParam(function(object, props) {
  if (object == null) {
    return {};
  }
  return typeof props[0] == 'function'
    ? pickByCallback(object, bindCallback(props[0], props[1], 3))
    : pickByArray(object, baseFlatten(props));
});

module.exports = pick;

},{"105":105,"123":123,"144":144,"170":170,"171":171}],196:[function(require,module,exports){
var baseValues = require(143),
    keys = require(191);

/**
 * Creates an array of the own enumerable property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return baseValues(object, keys(object));
}

module.exports = values;

},{"143":143,"191":191}],197:[function(require,module,exports){
var baseToString = require(141);

/**
 * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
 * In addition to special characters the forward slash is escaped to allow for
 * easier `eval` use and `Function` compilation.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
 * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = escapeRegExp;

},{"141":141}],198:[function(require,module,exports){
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var getter = _.constant(object);
 *
 * getter() === object;
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;

},{}],199:[function(require,module,exports){
/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],200:[function(require,module,exports){
/**
 * A no-operation function which returns `undefined` regardless of the
 * arguments it receives.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // No operation performed.
}

module.exports = noop;

},{}],201:[function(require,module,exports){
var baseProperty = require(137),
    basePropertyDeep = require(138),
    isKey = require(166);

/**
 * Creates a function which returns the property value at `path` on a
 * given object.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': { 'c': 2 } } },
 *   { 'a': { 'b': { 'c': 1 } } }
 * ];
 *
 * _.map(objects, _.property('a.b.c'));
 * // => [2, 1]
 *
 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
}

module.exports = property;

},{"137":137,"138":138,"166":166}],202:[function(require,module,exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}],"/marty.js":[function(require,module,exports){
// Need to define global for lodash
"use strict";

if (typeof global === "undefined" && typeof window !== "undefined") {
  window.global = window;
}

require(1).polyfill();
require(3);

var Marty = require(33);
var marty = new Marty("0.10.0", react());

marty.use(require(31));
marty.use(require(17));
marty.use(require(14));
marty.use(require(77));
marty.use(require(7));
marty.use(require(65));
marty.use(require(70));
marty.use(require(9));
marty.use(require(20));
marty.use(require(56));
marty.use(require(22));
marty.use(require(61));
marty.use(require(67));
marty.use(require(57));
marty.use(require(59));

module.exports = marty;

function react() {
  try {
    return module.parent.require("react");
  } catch (e) {
    try {
      return require("react");
    } catch (e) {
      if (window.React) {
        return window.React;
      }
    }
  }

  throw new Error("Could not find React");
}

},{"1":1,"14":14,"17":17,"20":20,"22":22,"3":3,"31":31,"33":33,"56":56,"57":57,"59":59,"61":61,"65":65,"67":67,"7":7,"70":70,"77":77,"9":9,"undefined":undefined}]},{},[])("/marty.js")
});