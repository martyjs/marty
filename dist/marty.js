(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Marty = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.1
 */

(function() {
    "use strict";

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$asap$$len = 0;

    var $$asap$$default = function asap(callback, arg) {
      $$asap$$queue[$$asap$$len] = callback;
      $$asap$$queue[$$asap$$len + 1] = arg;
      $$asap$$len += 2;
      if ($$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$asap$$scheduleFlush();
      }
    };

    var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$asap$$useNextTick() {
      return function() {
        process.nextTick($$asap$$flush);
      };
    }

    function $$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$asap$$useSetTimeout() {
      return function() {
        setTimeout($$asap$$flush, 1);
      };
    }

    var $$asap$$queue = new Array(1000);

    function $$asap$$flush() {
      for (var i = 0; i < $$asap$$len; i+=2) {
        var callback = $$asap$$queue[i];
        var arg = $$asap$$queue[i+1];

        callback(arg);

        $$asap$$queue[i] = undefined;
        $$asap$$queue[i+1] = undefined;
      }

      $$asap$$len = 0;
    }

    var $$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$asap$$scheduleFlush = $$asap$$useNextTick();
    } else if ($$asap$$BrowserMutationObserver) {
      $$asap$$scheduleFlush = $$asap$$useMutationObserver();
    } else if ($$asap$$isWorker) {
      $$asap$$scheduleFlush = $$asap$$useMessageChannel();
    } else {
      $$asap$$scheduleFlush = $$asap$$useSetTimeout();
    }

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function $$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.')
    }

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
       $$asap$$default(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          $$$internal$$resolve(promise, value);
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
      } else {
        $$asap$$default($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$asap$$default($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$asap$$default($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$$enumerator$$default = $$$enumerator$$Enumerator;

    $$$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$es6$promise$promise$$counter = 0;

    function $$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

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
    function $$es6$promise$promise$$Promise(resolver) {
      this._id = $$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof $$es6$promise$promise$$Promise)) {
          $$es6$promise$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    $$es6$promise$promise$$Promise.all = $$promise$all$$default;
    $$es6$promise$promise$$Promise.race = $$promise$race$$default;
    $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
    $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

    $$es6$promise$promise$$Promise.prototype = {
      constructor: $$es6$promise$promise$$Promise,

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

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor($$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          $$asap$$default(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
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

    var $$es6$promise$polyfill$$default = function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport =
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return $$utils$$isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = $$es6$promise$promise$$default;
      }
    };

    var es6$promise$umd$$ES6Promise = {
      'Promise': $$es6$promise$promise$$default,
      'polyfill': $$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = es6$promise$umd$$ES6Promise;
    }
}).call(this);
}).call(this,require(1),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1":1}],3:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
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
    name = name.toLowerCase()
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[name.toLowerCase()]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[name.toLowerCase()]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[name.toLowerCase()] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(name.toLowerCase())
  }

  Headers.prototype.set = function(name, value) {
    this.map[name.toLowerCase()] = [value]
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

    if (support.blob) {
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
      this._initBody = function(body) {
        this._bodyInit = body
        if (typeof body === 'string') {
          this._bodyText = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body
        } else if (!body) {
          this._bodyText = ''
        } else {
          throw new Error('unsupported BodyInit type')
        }
      }

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

  Request.prototype.fetch = function() {
    var self = this

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()
      if (self.credentials === 'cors') {
        xhr.withCredentials = true;
      }

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

      xhr.open(self.method, self.url, true)
      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      self.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof self._bodyInit === 'undefined' ? null : self._bodyInit)
    })
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
    this.statusText = options.statusText
    this.headers = options.headers
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (url, options) {
    return new Request(url, options).fetch()
  }
  self.fetch.polyfill = true
})();

},{}],4:[function(require,module,exports){
require(3);

},{"3":3}],5:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var DispatchCoordinator = require(10);

var ActionCreators = (function (_DispatchCoordinator) {
  function ActionCreators(options) {
    _classCallCheck(this, ActionCreators);

    _get(Object.getPrototypeOf(ActionCreators.prototype), 'constructor', this).call(this, 'ActionCreators', options);
  }

  _inherits(ActionCreators, _DispatchCoordinator);

  return ActionCreators;
})(DispatchCoordinator);

module.exports = ActionCreators;

},{"10":10}],6:[function(require,module,exports){
'use strict';

var _ = require(15);
var createClass = require(8);
var ActionCreators = require(5);
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

},{"15":15,"5":5,"8":8}],7:[function(require,module,exports){
'use strict';

var ActionCreators = require(5);
var createActionCreatorsClass = require(6);

module.exports = function (marty) {
  marty.registerClass('ActionCreators', ActionCreators);
  marty.register('createActionCreators', createActionCreators);

  function createActionCreators(properties) {
    var ActionCreatorsClass = createActionCreatorsClass(properties);
    var defaultInstance = this.register(ActionCreatorsClass);

    return defaultInstance;
  }
};

},{"5":5,"6":6}],8:[function(require,module,exports){
'use strict';

var _ = require(13);

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
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;

    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
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

},{"13":13}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(12);
var uuid = require(17);
var warnings = require(18);
var resolve = require(16);
var Environment = require(11);

var DispatchCoordinator = (function () {
  function DispatchCoordinator(type, options) {
    _classCallCheck(this, DispatchCoordinator);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
    this.__dispatcher = options.dispatcher;
  }

  _createClass(DispatchCoordinator, [{
    key: 'dispatch',
    value: function dispatch(type) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.__dispatcher.dispatchAction({
        type: type,
        arguments: args
      });
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'context',
    get: function () {
      return this.__context;
    }
  }]);

  return DispatchCoordinator;
})();

module.exports = DispatchCoordinator;

},{"11":11,"12":12,"16":16,"17":17,"18":18}],11:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],12:[function(require,module,exports){
'use strict';

var _ = require(13);
var Diagnostics = require(9);

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

},{"13":13,"9":9}],13:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(42),
  bind: require(73),
  defaults: require(112),
  each: require(30),
  extend: require(111),
  find: require(29),
  findKey: require(113),
  first: require(22),
  rest: require(25),
  has: require(115),
  initial: require(23),
  isArray: require(102),
  isFunction: require(62),
  isNull: require(105),
  isObject: require(106),
  isString: require(107),
  isUndefined: require(109),
  last: require(24),
  map: require(32),
  matches: require(125),
  noop: require(126),
  object: require(27),
  omit: require(118),
  pick: require(119),
  toArray: require(110),
  union: require(26),
  values: require(120),
  once: require(35),
  filter: require(28),
  invoke: require(31),
  sortBy: require(33),
  functions: require(114),
  difference: require(19) };

},{"102":102,"105":105,"106":106,"107":107,"109":109,"110":110,"111":111,"112":112,"113":113,"114":114,"115":115,"118":118,"119":119,"120":120,"125":125,"126":126,"19":19,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"35":35,"42":42,"62":62,"73":73}],14:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],15:[function(require,module,exports){
'use strict';

module.exports = require(13);

},{"13":13}],16:[function(require,module,exports){
'use strict';

var log = require(12);
var warnings = require(18);
var getContext = require(14);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"12":12,"14":14,"18":18}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

var _ = require(13);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"13":13}],19:[function(require,module,exports){
var baseDifference = require(49),
    baseFlatten = require(54),
    isArguments = require(101),
    isArray = require(102),
    restParam = require(36);

/**
 * Creates an array excluding all values of the provided arrays using
 * `SameValueZero` for equality comparisons.
 *
 * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * comparisons are like strict equality comparisons, e.g. `===`, except that
 * `NaN` matches `NaN`.
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
  return (isArray(array) || isArguments(array))
    ? baseDifference(array, baseFlatten(values, false, true))
    : [];
});

module.exports = difference;

},{"101":101,"102":102,"36":36,"49":49,"54":54}],20:[function(require,module,exports){
var baseSlice = require(68),
    isIterateeCall = require(93);

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

},{"68":68,"93":93}],21:[function(require,module,exports){
var baseSlice = require(68),
    isIterateeCall = require(93);

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

},{"68":68,"93":93}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
var dropRight = require(21);

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

},{"21":21}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
var drop = require(20);

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

},{"20":20}],26:[function(require,module,exports){
var baseFlatten = require(54),
    baseUniq = require(71),
    restParam = require(36);

/**
 * Creates an array of unique values, in order, of the provided arrays using
 * `SameValueZero` for equality comparisons.
 *
 * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * comparisons are like strict equality comparisons, e.g. `===`, except that
 * `NaN` matches `NaN`.
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

},{"36":36,"54":54,"71":71}],27:[function(require,module,exports){
var isArray = require(102);

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

},{"102":102}],28:[function(require,module,exports){
var arrayFilter = require(40),
    baseCallback = require(45),
    baseFilter = require(51),
    isArray = require(102);

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

},{"102":102,"40":40,"45":45,"51":51}],29:[function(require,module,exports){
var baseEach = require(50),
    createFind = require(82);

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

},{"50":50,"82":82}],30:[function(require,module,exports){
var arrayEach = require(39),
    baseEach = require(50),
    createForEach = require(84);

/**
 * Iterates over elements of `collection` invoking `iteratee` for each element.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection). Iterator functions may exit iteration early
 * by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a `length` property
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

},{"39":39,"50":50,"84":84}],31:[function(require,module,exports){
var baseEach = require(50),
    isLength = require(94),
    restParam = require(36);

/**
 * Invokes the method named by `methodName` on each element in `collection`,
 * returning an array of the results of each invoked method. Any additional
 * arguments are provided to each invoked method. If `methodName` is a function
 * it is invoked for, and `this` bound to, each element in `collection`.
 *
 * @static
 * @memberOf _
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|string} methodName The name of the method to invoke or
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
var invoke = restParam(function(collection, methodName, args) {
  var index = -1,
      isFunc = typeof methodName == 'function',
      length = collection ? collection.length : 0,
      result = isLength(length) ? Array(length) : [];

  baseEach(collection, function(value) {
    var func = isFunc ? methodName : (value != null && value[methodName]);
    result[++index] = func ? func.apply(value, args) : undefined;
  });
  return result;
});

module.exports = invoke;

},{"36":36,"50":50,"94":94}],32:[function(require,module,exports){
var arrayMap = require(41),
    baseCallback = require(45),
    baseMap = require(64),
    isArray = require(102);

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
 * Many lodash methods are guarded to work as interatees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`, `drop`,
 * `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`, `parseInt`,
 * `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`, `trimLeft`,
 * `trimRight`, `trunc`, `random`, `range`, `sample`, `some`, `uniq`, and `words`
 *
 * @static
 * @memberOf _
 * @alias collect
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
 *  per iteration.
 *  create a `_.property` or `_.matches` style callback respectively.
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

},{"102":102,"41":41,"45":45,"64":64}],33:[function(require,module,exports){
var baseCallback = require(45),
    baseEach = require(50),
    baseSortBy = require(69),
    compareAscending = require(77),
    isIterateeCall = require(93),
    isLength = require(94);

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
 * @param {Array|Function|Object|string} [iteratee=_.identity] The function
 *  invoked per iteration. If a property name or an object is provided it is
 *  used to create a `_.property` or `_.matches` style callback respectively.
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
  var index = -1,
      length = collection.length,
      result = isLength(length) ? Array(length) : [];

  if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
    iteratee = null;
  }
  iteratee = baseCallback(iteratee, thisArg, 3);
  baseEach(collection, function(value, key, collection) {
    result[++index] = { 'criteria': iteratee(value, key, collection), 'index': index, 'value': value };
  });
  return baseSortBy(result, compareAscending);
}

module.exports = sortBy;

},{"45":45,"50":50,"69":69,"77":77,"93":93,"94":94}],34:[function(require,module,exports){
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
    } else {
      func = null;
    }
    return result;
  };
}

module.exports = before;

},{}],35:[function(require,module,exports){
var before = require(34);

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
  return before(func, 2);
}

module.exports = once;

},{"34":34}],36:[function(require,module,exports){
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
  start = nativeMax(typeof start == 'undefined' ? (func.length - 1) : (+start || 0), 0);
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

},{}],37:[function(require,module,exports){
(function (global){
var cachePush = require(76),
    isNative = require(104);

/** Native method references. */
var Set = isNative(Set = global.Set) && Set;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"104":104,"76":76}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
/**
 * Used by `_.defaults` to customize its `_.assign` use.
 *
 * @private
 * @param {*} objectValue The destination object property value.
 * @param {*} sourceValue The source object property value.
 * @returns {*} Returns the value to assign to the destination object.
 */
function assignDefaults(objectValue, sourceValue) {
  return typeof objectValue == 'undefined' ? sourceValue : objectValue;
}

module.exports = assignDefaults;

},{}],44:[function(require,module,exports){
var baseCopy = require(48),
    keys = require(116);

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize assigning values.
 * @returns {Object} Returns the destination object.
 */
function baseAssign(object, source, customizer) {
  var props = keys(source);
  if (!customizer) {
    return baseCopy(source, object, props);
  }
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (typeof value == 'undefined' && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

module.exports = baseAssign;

},{"116":116,"48":48}],45:[function(require,module,exports){
var baseMatches = require(65),
    baseMatchesProperty = require(66),
    baseProperty = require(67),
    bindCallback = require(73),
    identity = require(124);

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
    return typeof thisArg == 'undefined'
      ? func
      : bindCallback(func, thisArg, argCount);
  }
  if (func == null) {
    return identity;
  }
  if (type == 'object') {
    return baseMatches(func);
  }
  return typeof thisArg == 'undefined'
    ? baseProperty(func + '')
    : baseMatchesProperty(func + '', thisArg);
}

module.exports = baseCallback;

},{"124":124,"65":65,"66":66,"67":67,"73":73}],46:[function(require,module,exports){
var arrayCopy = require(38),
    arrayEach = require(39),
    baseCopy = require(48),
    baseForOwn = require(57),
    initCloneArray = require(89),
    initCloneByTag = require(90),
    initCloneObject = require(91),
    isArray = require(102),
    isObject = require(106),
    keys = require(116);

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

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
cloneableTags[dateTag] = cloneableTags[float32Tag] =
cloneableTags[float64Tag] = cloneableTags[int8Tag] =
cloneableTags[int16Tag] = cloneableTags[int32Tag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[stringTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[mapTag] = cloneableTags[setTag] =
cloneableTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * The base implementation of `_.clone` without support for argument juggling
 * and `this` binding `customizer` functions.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {Function} [customizer] The function to customize cloning values.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The object `value` belongs to.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates clones with source counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object) : customizer(value);
  }
  if (typeof result != 'undefined') {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return arrayCopy(value, result);
    }
  } else {
    var tag = objToString.call(value),
        isFunc = tag == funcTag;

    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return baseCopy(value, result, keys(value));
      }
    } else {
      return cloneableTags[tag]
        ? initCloneByTag(value, tag, isDeep)
        : (object ? value : {});
    }
  }
  // Check for circular references and return corresponding clone.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == value) {
      return stackB[length];
    }
  }
  // Add the source value to the stack of traversed objects and associate it with its clone.
  stackA.push(value);
  stackB.push(result);

  // Recursively populate clone (susceptible to call stack limits).
  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
    result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
  });
  return result;
}

module.exports = baseClone;

},{"102":102,"106":106,"116":116,"38":38,"39":39,"48":48,"57":57,"89":89,"90":90,"91":91}],47:[function(require,module,exports){
/**
 * The base implementation of `compareAscending` which compares values and
 * sorts them in ascending order without guaranteeing a stable sort.
 *
 * @private
 * @param {*} value The value to compare to `other`.
 * @param {*} other The value to compare to `value`.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function baseCompareAscending(value, other) {
  if (value !== other) {
    var valIsReflexive = value === value,
        othIsReflexive = other === other;

    if (value > other || !valIsReflexive || (typeof value == 'undefined' && othIsReflexive)) {
      return 1;
    }
    if (value < other || !othIsReflexive || (typeof other == 'undefined' && valIsReflexive)) {
      return -1;
    }
  }
  return 0;
}

module.exports = baseCompareAscending;

},{}],48:[function(require,module,exports){
/**
 * Copies the properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Array} props The property names to copy.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, object, props) {
  if (!props) {
    props = object;
    object = {};
  }
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],49:[function(require,module,exports){
var baseIndexOf = require(59),
    cacheIndexOf = require(75),
    createCache = require(81);

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

},{"59":59,"75":75,"81":81}],50:[function(require,module,exports){
var baseForOwn = require(57),
    createBaseEach = require(79);

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

},{"57":57,"79":79}],51:[function(require,module,exports){
var baseEach = require(50);

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

},{"50":50}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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

},{}],54:[function(require,module,exports){
var isArguments = require(101),
    isArray = require(102),
    isLength = require(94),
    isObjectLike = require(95);

/**
 * The base implementation of `_.flatten` with added support for restricting
 * flattening and specifying the start index.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} isDeep Specify a deep flatten.
 * @param {boolean} isStrict Restrict flattening to arrays and `arguments` objects.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, isDeep, isStrict) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))) {
      if (isDeep) {
        // Recursively flatten arrays (susceptible to call stack limits).
        value = baseFlatten(value, isDeep, isStrict);
      }
      var valIndex = -1,
          valLength = value.length;

      result.length += valLength;
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

},{"101":101,"102":102,"94":94,"95":95}],55:[function(require,module,exports){
var createBaseFor = require(80);

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iterator functions may exit iteration early by explicitly
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

},{"80":80}],56:[function(require,module,exports){
var baseFor = require(55),
    keysIn = require(117);

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

},{"117":117,"55":55}],57:[function(require,module,exports){
var baseFor = require(55),
    keys = require(116);

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

},{"116":116,"55":55}],58:[function(require,module,exports){
var isFunction = require(103);

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

},{"103":103}],59:[function(require,module,exports){
var indexOfNaN = require(88);

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

},{"88":88}],60:[function(require,module,exports){
var baseIsEqualDeep = require(61);

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
  // Exit early for identical values.
  if (value === other) {
    // Treat `+0` vs. `-0` as not equal.
    return value !== 0 || (1 / value == 1 / other);
  }
  var valType = typeof value,
      othType = typeof other;

  // Exit early for unlike primitive values.
  if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
      value == null || other == null) {
    // Return `false` unless both values are `NaN`.
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
}

module.exports = baseIsEqual;

},{"61":61}],61:[function(require,module,exports){
var equalArrays = require(85),
    equalByTag = require(86),
    equalObjects = require(87),
    isArray = require(102),
    isTypedArray = require(108);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    funcTag = '[object Function]',
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
  var objIsObj = (objTag == objectTag || (isLoose && objTag == funcTag)),
      othIsObj = (othTag == objectTag || (isLoose && othTag == funcTag)),
      isSameTag = objTag == othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (isLoose) {
    if (!isSameTag && !(objIsObj && othIsObj)) {
      return false;
    }
  } else {
    var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (valWrapped || othWrapped) {
      return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
    }
    if (!isSameTag) {
      return false;
    }
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

},{"102":102,"108":108,"85":85,"86":86,"87":87}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
var baseIsEqual = require(60);

/**
 * The base implementation of `_.isMatch` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Array} props The source property names to match.
 * @param {Array} values The source values to match.
 * @param {Array} strictCompareFlags Strict comparison flags for source values.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
  var index = -1,
      length = props.length,
      noCustomizer = !customizer;

  while (++index < length) {
    if ((noCustomizer && strictCompareFlags[index])
          ? values[index] !== object[props[index]]
          : !(props[index] in object)
        ) {
      return false;
    }
  }
  index = -1;
  while (++index < length) {
    var key = props[index],
        objValue = object[key],
        srcValue = values[index];

    if (noCustomizer && strictCompareFlags[index]) {
      var result = typeof objValue != 'undefined' || (key in object);
    } else {
      result = customizer ? customizer(objValue, srcValue, key) : undefined;
      if (typeof result == 'undefined') {
        result = baseIsEqual(srcValue, objValue, customizer, true);
      }
    }
    if (!result) {
      return false;
    }
  }
  return true;
}

module.exports = baseIsMatch;

},{"60":60}],64:[function(require,module,exports){
var baseEach = require(50);

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
  var result = [];
  baseEach(collection, function(value, key, collection) {
    result.push(iteratee(value, key, collection));
  });
  return result;
}

module.exports = baseMap;

},{"50":50}],65:[function(require,module,exports){
var baseIsMatch = require(63),
    constant = require(123),
    isStrictComparable = require(96),
    keys = require(116),
    toObject = require(100);

/**
 * The base implementation of `_.matches` which does not clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new function.
 */
function baseMatches(source) {
  var props = keys(source),
      length = props.length;

  if (!length) {
    return constant(true);
  }
  if (length == 1) {
    var key = props[0],
        value = source[key];

    if (isStrictComparable(value)) {
      return function(object) {
        return object != null && object[key] === value &&
          (typeof value != 'undefined' || (key in toObject(object)));
      };
    }
  }
  var values = Array(length),
      strictCompareFlags = Array(length);

  while (length--) {
    value = source[props[length]];
    values[length] = value;
    strictCompareFlags[length] = isStrictComparable(value);
  }
  return function(object) {
    return object != null && baseIsMatch(toObject(object), props, values, strictCompareFlags);
  };
}

module.exports = baseMatches;

},{"100":100,"116":116,"123":123,"63":63,"96":96}],66:[function(require,module,exports){
var baseIsEqual = require(60),
    isStrictComparable = require(96),
    toObject = require(100);

/**
 * The base implementation of `_.matchesProperty` which does not coerce `key`
 * to a string.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} value The value to compare.
 * @returns {Function} Returns the new function.
 */
function baseMatchesProperty(key, value) {
  if (isStrictComparable(value)) {
    return function(object) {
      return object != null && object[key] === value &&
        (typeof value != 'undefined' || (key in toObject(object)));
    };
  }
  return function(object) {
    return object != null && baseIsEqual(value, object[key], null, true);
  };
}

module.exports = baseMatchesProperty;

},{"100":100,"60":60,"96":96}],67:[function(require,module,exports){
/**
 * The base implementation of `_.property` which does not coerce `key` to a string.
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

},{}],68:[function(require,module,exports){
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
  end = (typeof end == 'undefined' || end > length) ? length : (+end || 0);
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

},{}],69:[function(require,module,exports){
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

},{}],70:[function(require,module,exports){
/**
 * Converts `value` to a string if it is not one. An empty string is returned
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

},{}],71:[function(require,module,exports){
var baseIndexOf = require(59),
    cacheIndexOf = require(75),
    createCache = require(81);

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

},{"59":59,"75":75,"81":81}],72:[function(require,module,exports){
/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * returned by `keysFunc`.
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

},{}],73:[function(require,module,exports){
var identity = require(124);

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
  if (typeof thisArg == 'undefined') {
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

},{"124":124}],74:[function(require,module,exports){
(function (global){
var constant = require(123),
    isNative = require(104);

/** Native method references. */
var ArrayBuffer = isNative(ArrayBuffer = global.ArrayBuffer) && ArrayBuffer,
    bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,
    floor = Math.floor,
    Uint8Array = isNative(Uint8Array = global.Uint8Array) && Uint8Array;

/** Used to clone array buffers. */
var Float64Array = (function() {
  // Safari 5 errors when using an array buffer to initialize a typed array
  // where the array buffer's `byteLength` is not a multiple of the typed
  // array's `BYTES_PER_ELEMENT`.
  try {
    var func = isNative(func = global.Float64Array) && func,
        result = new func(new ArrayBuffer(10), 0, 1) && func;
  } catch(e) {}
  return result;
}());

/** Used as the size, in bytes, of each `Float64Array` element. */
var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;

/**
 * Creates a clone of the given array buffer.
 *
 * @private
 * @param {ArrayBuffer} buffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function bufferClone(buffer) {
  return bufferSlice.call(buffer, 0);
}
if (!bufferSlice) {
  // PhantomJS has `ArrayBuffer` and `Uint8Array` but not `Float64Array`.
  bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {
    var byteLength = buffer.byteLength,
        floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,
        offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,
        result = new ArrayBuffer(byteLength);

    if (floatLength) {
      var view = new Float64Array(result, 0, floatLength);
      view.set(new Float64Array(buffer, 0, floatLength));
    }
    if (byteLength != offset) {
      view = new Uint8Array(result, offset);
      view.set(new Uint8Array(buffer, offset));
    }
    return result;
  };
}

module.exports = bufferClone;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"104":104,"123":123}],75:[function(require,module,exports){
var isObject = require(106);

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

},{"106":106}],76:[function(require,module,exports){
var isObject = require(106);

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

},{"106":106}],77:[function(require,module,exports){
var baseCompareAscending = require(47);

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

},{"47":47}],78:[function(require,module,exports){
var bindCallback = require(73),
    isIterateeCall = require(93);

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
  return function() {
    var args = arguments,
        length = args.length,
        object = args[0];

    if (length < 2 || object == null) {
      return object;
    }
    var customizer = args[length - 2],
        thisArg = args[length - 1],
        guard = args[3];

    if (length > 3 && typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = (length > 2 && typeof thisArg == 'function') ? thisArg : null;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(args[1], args[2], guard)) {
      customizer = length == 3 ? null : customizer;
      length = 2;
    }
    var index = 0;
    while (++index < length) {
      var source = args[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  };
}

module.exports = createAssigner;

},{"73":73,"93":93}],79:[function(require,module,exports){
var isLength = require(94),
    toObject = require(100);

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
    var length = collection ? collection.length : 0;
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

},{"100":100,"94":94}],80:[function(require,module,exports){
var toObject = require(100);

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

},{"100":100}],81:[function(require,module,exports){
(function (global){
var SetCache = require(37),
    constant = require(123),
    isNative = require(104);

/** Native method references. */
var Set = isNative(Set = global.Set) && Set;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"104":104,"123":123,"37":37}],82:[function(require,module,exports){
var baseCallback = require(45),
    baseFind = require(52),
    baseFindIndex = require(53),
    isArray = require(102);

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
  }
}

module.exports = createFind;

},{"102":102,"45":45,"52":52,"53":53}],83:[function(require,module,exports){
var baseCallback = require(45),
    baseFind = require(52);

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

},{"45":45,"52":52}],84:[function(require,module,exports){
var bindCallback = require(73),
    isArray = require(102);

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
    return (typeof iteratee == 'function' && typeof thisArg == 'undefined' && isArray(collection))
      ? arrayFunc(collection, iteratee)
      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
  };
}

module.exports = createForEach;

},{"102":102,"73":73}],85:[function(require,module,exports){
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
      othLength = other.length,
      result = true;

  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Deep compare the contents, ignoring non-numeric properties.
  while (result && ++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    result = undefined;
    if (customizer) {
      result = isLoose
        ? customizer(othValue, arrValue, index)
        : customizer(arrValue, othValue, index);
    }
    if (typeof result == 'undefined') {
      // Recursively compare arrays (susceptible to call stack limits).
      if (isLoose) {
        var othIndex = othLength;
        while (othIndex--) {
          othValue = other[othIndex];
          result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          if (result) {
            break;
          }
        }
      } else {
        result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
      }
    }
  }
  return !!result;
}

module.exports = equalArrays;

},{}],86:[function(require,module,exports){
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
        // But, treat `-0` vs. `+0` as not equal.
        : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings primitives and string
      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
      return object == (other + '');
  }
  return false;
}

module.exports = equalByTag;

},{}],87:[function(require,module,exports){
var keys = require(116);

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
  var skipCtor = isLoose,
      index = -1;

  while (++index < objLength) {
    var key = objProps[index],
        result = isLoose ? key in other : hasOwnProperty.call(other, key);

    if (result) {
      var objValue = object[key],
          othValue = other[key];

      result = undefined;
      if (customizer) {
        result = isLoose
          ? customizer(othValue, objValue, key)
          : customizer(objValue, othValue, key);
      }
      if (typeof result == 'undefined') {
        // Recursively compare objects (susceptible to call stack limits).
        result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB);
      }
    }
    if (!result) {
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

},{"116":116}],88:[function(require,module,exports){
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

},{}],89:[function(require,module,exports){
/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add array properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;

},{}],90:[function(require,module,exports){
var bufferClone = require(74);

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

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

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return bufferClone(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      var buffer = object.buffer;
      return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      var result = new Ctor(object.source, reFlags.exec(object));
      result.lastIndex = object.lastIndex;
  }
  return result;
}

module.exports = initCloneByTag;

},{"74":74}],91:[function(require,module,exports){
/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  var Ctor = object.constructor;
  if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
    Ctor = Object;
  }
  return new Ctor;
}

module.exports = initCloneObject;

},{}],92:[function(require,module,exports){
/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

},{}],93:[function(require,module,exports){
var isIndex = require(92),
    isLength = require(94),
    isObject = require(106);

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
  if (type == 'number') {
    var length = object.length,
        prereq = isLength(length) && isIndex(index, length);
  } else {
    prereq = type == 'string' && index in object;
  }
  if (prereq) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

module.exports = isIterateeCall;

},{"106":106,"92":92,"94":94}],94:[function(require,module,exports){
/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

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

},{}],95:[function(require,module,exports){
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

},{}],96:[function(require,module,exports){
var isObject = require(106);

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
}

module.exports = isStrictComparable;

},{"106":106}],97:[function(require,module,exports){
var toObject = require(100);

/**
 * A specialized version of `_.pick` that picks `object` properties specified
 * by the `props` array.
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

},{"100":100}],98:[function(require,module,exports){
var baseForIn = require(56);

/**
 * A specialized version of `_.pick` that picks `object` properties `predicate`
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

},{"56":56}],99:[function(require,module,exports){
var isArguments = require(101),
    isArray = require(102),
    isIndex = require(92),
    isLength = require(94),
    keysIn = require(117),
    support = require(122);

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object)));

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

},{"101":101,"102":102,"117":117,"122":122,"92":92,"94":94}],100:[function(require,module,exports){
var isObject = require(106);

/**
 * Converts `value` to an object if it is not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

},{"106":106}],101:[function(require,module,exports){
var isLength = require(94),
    isObjectLike = require(95);

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
  var length = isObjectLike(value) ? value.length : undefined;
  return isLength(length) && objToString.call(value) == argsTag;
}

module.exports = isArguments;

},{"94":94,"95":95}],102:[function(require,module,exports){
var isLength = require(94),
    isNative = require(104),
    isObjectLike = require(95);

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
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

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

},{"104":104,"94":94,"95":95}],103:[function(require,module,exports){
(function (global){
var baseIsFunction = require(62),
    isNative = require(104);

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
var Uint8Array = isNative(Uint8Array = global.Uint8Array) && Uint8Array;

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"104":104,"62":62}],104:[function(require,module,exports){
var escapeRegExp = require(121),
    isObjectLike = require(95);

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
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
    return reNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reHostCtor.test(value);
}

module.exports = isNative;

},{"121":121,"95":95}],105:[function(require,module,exports){
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

},{}],106:[function(require,module,exports){
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
  return type == 'function' || (!!value && type == 'object');
}

module.exports = isObject;

},{}],107:[function(require,module,exports){
var isObjectLike = require(95);

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

},{"95":95}],108:[function(require,module,exports){
var isLength = require(94),
    isObjectLike = require(95);

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

},{"94":94,"95":95}],109:[function(require,module,exports){
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
  return typeof value == 'undefined';
}

module.exports = isUndefined;

},{}],110:[function(require,module,exports){
var arrayCopy = require(38),
    isLength = require(94),
    values = require(120);

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
  var length = value ? value.length : 0;
  if (!isLength(length)) {
    return values(value);
  }
  if (!length) {
    return [];
  }
  return arrayCopy(value);
}

module.exports = toArray;

},{"120":120,"38":38,"94":94}],111:[function(require,module,exports){
var baseAssign = require(44),
    createAssigner = require(78);

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigning values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return typeof value == 'undefined' ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(baseAssign);

module.exports = assign;

},{"44":44,"78":78}],112:[function(require,module,exports){
var assign = require(111),
    assignDefaults = require(43),
    restParam = require(36);

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object for all destination properties that resolve to `undefined`. Once a
 * property is set, additional values of the same property are ignored.
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

},{"111":111,"36":36,"43":43}],113:[function(require,module,exports){
var baseForOwn = require(57),
    createFindKey = require(83);

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

},{"57":57,"83":83}],114:[function(require,module,exports){
var baseFunctions = require(58),
    keysIn = require(117);

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

},{"117":117,"58":58}],115:[function(require,module,exports){
/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `key` exists as a direct property of `object` instead of an
 * inherited property.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @param {string} key The key to check.
 * @returns {boolean} Returns `true` if `key` is a direct property, else `false`.
 * @example
 *
 * var object = { 'a': 1, 'b': 2, 'c': 3 };
 *
 * _.has(object, 'b');
 * // => true
 */
function has(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}

module.exports = has;

},{}],116:[function(require,module,exports){
var isLength = require(94),
    isNative = require(104),
    isObject = require(106),
    shimKeys = require(99);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

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
 * @param {Object} object The object to inspect.
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
  if (object) {
    var Ctor = object.constructor,
        length = object.length;
  }
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && (length && isLength(length)))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

},{"104":104,"106":106,"94":94,"99":99}],117:[function(require,module,exports){
var isArguments = require(101),
    isArray = require(102),
    isIndex = require(92),
    isLength = require(94),
    isObject = require(106),
    support = require(122);

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
 * @param {Object} object The object to inspect.
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
    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

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

},{"101":101,"102":102,"106":106,"122":122,"92":92,"94":94}],118:[function(require,module,exports){
var arrayMap = require(41),
    baseDifference = require(49),
    baseFlatten = require(54),
    bindCallback = require(73),
    keysIn = require(117),
    pickByArray = require(97),
    pickByCallback = require(98),
    restParam = require(36);

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable properties of `object` that are not omitted.
 * Property names may be specified as individual arguments or as arrays of
 * property names. If `predicate` is provided it is invoked for each property
 * of `object` omitting the properties `predicate` returns truthy for. The
 * predicate is bound to `thisArg` and invoked with three arguments:
 * (value, key, object).
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

},{"117":117,"36":36,"41":41,"49":49,"54":54,"73":73,"97":97,"98":98}],119:[function(require,module,exports){
var baseFlatten = require(54),
    bindCallback = require(73),
    pickByArray = require(97),
    pickByCallback = require(98),
    restParam = require(36);

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

},{"36":36,"54":54,"73":73,"97":97,"98":98}],120:[function(require,module,exports){
var baseValues = require(72),
    keys = require(116);

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

},{"116":116,"72":72}],121:[function(require,module,exports){
var baseToString = require(70);

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

},{"70":70}],122:[function(require,module,exports){
(function (global){
/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to detect DOM support. */
var document = (document = global.window) && document.document;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * An object environment feature flags.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

(function(x) {

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but Firefox OS certified apps, older Opera mobile browsers, and
   * the PlayStation 3; forced `false` for Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = /\bthis\b/.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  /**
   * Detect if the DOM is supported.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.dom = document.createDocumentFragment().nodeType === 11;
  } catch(e) {
    support.dom = false;
  }

  /**
   * Detect if `arguments` object indexes are non-enumerable.
   *
   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
   * checks for indexes that exceed their function's formal parameters with
   * associated values of `0`.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
  } catch(e) {
    support.nonEnumArgs = true;
  }
}(0, 0));

module.exports = support;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],123:[function(require,module,exports){
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

},{}],124:[function(require,module,exports){
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

},{}],125:[function(require,module,exports){
var baseClone = require(46),
    baseMatches = require(65);

/**
 * Creates a function which performs a deep comparison between a given object
 * and `source`, returning `true` if the given object has equivalent property
 * values, else `false`.
 *
 * **Note:** This method supports comparing arrays, booleans, `Date` objects,
 * numbers, `Object` objects, regexes, and strings. Objects are compared by
 * their own, not inherited, enumerable properties. For comparing a single
 * own or inherited property value see `_.matchesProperty`.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, _.matches({ 'age': 40, 'active': false }));
 * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
 */
function matches(source) {
  return baseMatches(baseClone(source, true));
}

module.exports = matches;

},{"46":46,"65":65}],126:[function(require,module,exports){
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

},{}],127:[function(require,module,exports){
'use strict';

var log = require(130);
var _ = require(132);
var warnings = require(133);

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
        constants[type] = createActionCreator(type);
      });
    });

    return constants;
  }

  function createActionCreator(actionType) {
    var constantActionCreator = function constantActionCreator(actionCreator) {
      if (warnings.invokeConstant) {
        log.warn('Warning: Invoking constants has been depreciated. ' + 'Please migrate to new style of creating action creators ' + 'http://martyjs.org/guides/action-creators/migrating-from-v8.html');
      }

      if (!_.isFunction(actionCreator)) {
        actionCreator = autoDispatch;
      }

      return function () {
        var context = actionContext(this);

        actionCreator.apply(context, arguments);

        function actionContext(creators) {
          return _.extend({}, creators, {
            dispatch: function dispatch() {
              var args = _.toArray(arguments);

              args.unshift(actionType);

              creators.dispatch.apply(creators, args);
            }
          });
        }
      };

      function autoDispatch() {
        this.dispatch.apply(this, arguments);
      }
    };

    constantActionCreator.type = actionType;
    constantActionCreator.isActionCreator = true;
    constantActionCreator.toString = function () {
      return actionType;
    };

    return constantActionCreator;
  }
}

module.exports = constants;

},{"130":130,"132":132,"133":133}],128:[function(require,module,exports){
'use strict';

var constants = require(127);

module.exports = function (marty) {
  marty.register('createConstants', createConstants);

  function createConstants(obj) {
    return constants(obj);
  }
};

},{"127":127}],129:[function(require,module,exports){
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

},{}],130:[function(require,module,exports){
'use strict';

var _ = require(131);
var Diagnostics = require(129);

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

},{"129":129,"131":131}],131:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(157),
  bind: require(188),
  defaults: require(227),
  each: require(145),
  extend: require(226),
  find: require(144),
  findKey: require(228),
  first: require(137),
  rest: require(140),
  has: require(230),
  initial: require(138),
  isArray: require(217),
  isFunction: require(177),
  isNull: require(220),
  isObject: require(221),
  isString: require(222),
  isUndefined: require(224),
  last: require(139),
  map: require(147),
  matches: require(240),
  noop: require(241),
  object: require(142),
  omit: require(233),
  pick: require(234),
  toArray: require(225),
  union: require(141),
  values: require(235),
  once: require(150),
  filter: require(143),
  invoke: require(146),
  sortBy: require(148),
  functions: require(229),
  difference: require(134) };

},{"134":134,"137":137,"138":138,"139":139,"140":140,"141":141,"142":142,"143":143,"144":144,"145":145,"146":146,"147":147,"148":148,"150":150,"157":157,"177":177,"188":188,"217":217,"220":220,"221":221,"222":222,"224":224,"225":225,"226":226,"227":227,"228":228,"229":229,"230":230,"233":233,"234":234,"235":235,"240":240,"241":241}],132:[function(require,module,exports){
'use strict';

module.exports = require(131);

},{"131":131}],133:[function(require,module,exports){
'use strict';

var _ = require(131);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"131":131}],134:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"151":151,"164":164,"169":169,"19":19,"216":216,"217":217}],135:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"183":183,"20":20,"208":208}],136:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"183":183,"208":208,"21":21}],137:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],138:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"136":136,"23":23}],139:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],140:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"135":135,"25":25}],141:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"151":151,"169":169,"186":186,"26":26}],142:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"217":217,"27":27}],143:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"155":155,"160":160,"166":166,"217":217,"28":28}],144:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"165":165,"197":197,"29":29}],145:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"154":154,"165":165,"199":199,"30":30}],146:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"151":151,"165":165,"209":209,"31":31}],147:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"156":156,"160":160,"179":179,"217":217,"32":32}],148:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"160":160,"165":165,"184":184,"192":192,"208":208,"209":209,"33":33}],149:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],150:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"149":149,"35":35}],151:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],152:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"191":191,"219":219,"37":37}],153:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],154:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],155:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],156:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],157:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],158:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],159:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"163":163,"231":231,"44":44}],160:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"180":180,"181":181,"182":182,"188":188,"239":239,"45":45}],161:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"153":153,"154":154,"163":163,"172":172,"204":204,"205":205,"206":206,"217":217,"221":221,"231":231,"46":46}],162:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],163:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],164:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"174":174,"190":190,"196":196,"49":49}],165:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"172":172,"194":194,"50":50}],166:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"165":165,"51":51}],167:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],168:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],169:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"209":209,"210":210,"216":216,"217":217,"54":54}],170:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"195":195,"55":55}],171:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"170":170,"232":232,"56":56}],172:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"170":170,"231":231,"57":57}],173:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"218":218,"58":58}],174:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"203":203,"59":59}],175:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"176":176,"60":60}],176:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"200":200,"201":201,"202":202,"217":217,"223":223,"61":61}],177:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],178:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"175":175,"63":63}],179:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"165":165,"64":64}],180:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"178":178,"211":211,"215":215,"231":231,"238":238,"65":65}],181:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"175":175,"211":211,"215":215,"66":66}],182:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],183:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],184:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],185:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],186:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"174":174,"190":190,"196":196,"71":71}],187:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],188:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"239":239,"73":73}],189:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"219":219,"238":238,"74":74}],190:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"221":221,"75":75}],191:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"221":221,"76":76}],192:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"162":162,"77":77}],193:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"188":188,"208":208,"78":78}],194:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"209":209,"215":215,"79":79}],195:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"215":215,"80":80}],196:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"152":152,"219":219,"238":238,"81":81}],197:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"160":160,"167":167,"168":168,"217":217,"82":82}],198:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"160":160,"167":167,"83":83}],199:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"188":188,"217":217,"84":84}],200:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],201:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],202:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"231":231,"87":87}],203:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],204:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],205:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"189":189,"90":90}],206:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],207:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],208:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"207":207,"209":209,"221":221,"93":93}],209:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],210:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],211:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"221":221,"96":96}],212:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"215":215,"97":97}],213:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"171":171,"98":98}],214:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"207":207,"209":209,"216":216,"217":217,"232":232,"237":237,"99":99}],215:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"221":221}],216:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"209":209,"210":210}],217:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"209":209,"210":210,"219":219}],218:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"177":177,"219":219}],219:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"210":210,"236":236}],220:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],221:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],222:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"210":210}],223:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"209":209,"210":210}],224:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],225:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"153":153,"209":209,"235":235}],226:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"159":159,"193":193}],227:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"151":151,"158":158,"226":226}],228:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"172":172,"198":198}],229:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"173":173,"232":232}],230:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],231:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"209":209,"214":214,"219":219,"221":221}],232:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"207":207,"209":209,"216":216,"217":217,"221":221,"237":237}],233:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"151":151,"156":156,"164":164,"169":169,"188":188,"212":212,"213":213,"232":232}],234:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"151":151,"169":169,"188":188,"212":212,"213":213}],235:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"187":187,"231":231}],236:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"185":185}],237:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],238:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],239:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],240:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"161":161,"180":180}],241:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],242:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var log = require(246);
var _ = require(250);
var uuid = require(251);
var StoreObserver = require(248);
var getFetchResult = require(243);
var getClassName = require(249);

var RESERVED_FUNCTIONS = ['contextTypes', 'componentDidMount', 'onStoreChanged', 'componentWillUnmount', 'getInitialState', 'getState', 'render'];

module.exports = function (React) {
  return function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    var id = uuid.type('Component');
    var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    var contextTypes = _.extend({
      marty: React.PropTypes.object
    }, config.contextTypes);

    var Container = React.createClass(_.extend({
      contextTypes: contextTypes,
      componentDidMount: function componentDidMount() {
        var component = {
          id: id,
          displayName: innerComponentDisplayName
        };

        this.observer = new StoreObserver({
          component: component,
          onStoreChanged: this.onStoreChanged,
          stores: getStoresToListenTo(this.listenTo, component)
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
        return this.getState();
      },
      getState: function getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done: function done(results) {
        return React.createElement(InnerComponent, _extends({ ref: 'innerComponent' }, this.props, results));
      },
      getInnerComponent: function getInnerComponent() {
        return this.refs.innerComponent;
      },
      render: function render() {
        var container = this;

        return this.state.result.when({
          done: function done(results) {
            if (_.isFunction(container.done)) {
              return container.done(results);
            }

            throw new Error('The `done` handler must be a function');
          },
          pending: function pending() {
            if (_.isFunction(container.pending)) {
              return container.pending();
            }

            return React.createElement('div', null);
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

  function getStoresToListenTo(stores, component) {
    if (!stores) {
      return [];
    }

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    return _.filter(stores, function (store) {
      var isStore = store.constructor.type === 'Store';

      if (!isStore) {
        log.warn('Warning: Trying to listen to something that isn\'t a store', store, component.displayName);
      }

      return isStore;
    });
  }
};

},{"243":243,"246":246,"248":248,"249":249,"250":250,"251":251}],243:[function(require,module,exports){
'use strict';

var log = require(246);
var _ = require(250);
var fetch = require(360);

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
    return fetch.pending();
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

},{"246":246,"250":250,"360":360}],244:[function(require,module,exports){
'use strict';

module.exports = function (marty, React) {
  marty.register('createContainer', require(242)(React));
};

},{"242":242}],245:[function(require,module,exports){
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

},{}],246:[function(require,module,exports){
'use strict';

var _ = require(247);
var Diagnostics = require(245);

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

},{"245":245,"247":247}],247:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(275),
  bind: require(306),
  defaults: require(345),
  each: require(263),
  extend: require(344),
  find: require(262),
  findKey: require(346),
  first: require(255),
  rest: require(258),
  has: require(348),
  initial: require(256),
  isArray: require(335),
  isFunction: require(295),
  isNull: require(338),
  isObject: require(339),
  isString: require(340),
  isUndefined: require(342),
  last: require(257),
  map: require(265),
  matches: require(358),
  noop: require(359),
  object: require(260),
  omit: require(351),
  pick: require(352),
  toArray: require(343),
  union: require(259),
  values: require(353),
  once: require(268),
  filter: require(261),
  invoke: require(264),
  sortBy: require(266),
  functions: require(347),
  difference: require(252) };

},{"252":252,"255":255,"256":256,"257":257,"258":258,"259":259,"260":260,"261":261,"262":262,"263":263,"264":264,"265":265,"266":266,"268":268,"275":275,"295":295,"306":306,"335":335,"338":338,"339":339,"340":340,"342":342,"343":343,"344":344,"345":345,"346":346,"347":347,"348":348,"351":351,"352":352,"353":353,"358":358,"359":359}],248:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(246);
var _ = require(247);

var StoreObserver = (function () {
  function StoreObserver(options) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    options = options || {};

    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    this.listeners = _.map(options.stores, function (store) {
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

      return store['for'](component).addChangeListener(function (state, store) {
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

module.exports = StoreObserver;

},{"246":246,"247":247}],249:[function(require,module,exports){
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

},{}],250:[function(require,module,exports){
'use strict';

module.exports = require(247);

},{"247":247}],251:[function(require,module,exports){
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

},{}],252:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"269":269,"282":282,"287":287,"334":334,"335":335}],253:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"301":301,"326":326}],254:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"301":301,"326":326}],255:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],256:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"254":254}],257:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],258:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"253":253}],259:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"269":269,"287":287,"304":304}],260:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"335":335}],261:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"273":273,"278":278,"28":28,"284":284,"335":335}],262:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"283":283,"29":29,"315":315}],263:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"272":272,"283":283,"30":30,"317":317}],264:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"269":269,"283":283,"31":31,"327":327}],265:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"274":274,"278":278,"297":297,"32":32,"335":335}],266:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"278":278,"283":283,"302":302,"310":310,"326":326,"327":327,"33":33}],267:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],268:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"267":267,"35":35}],269:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],270:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"309":309,"337":337,"37":37}],271:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],272:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],273:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],274:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],275:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],276:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],277:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"281":281,"349":349,"44":44}],278:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"298":298,"299":299,"300":300,"306":306,"357":357,"45":45}],279:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"271":271,"272":272,"281":281,"290":290,"322":322,"323":323,"324":324,"335":335,"339":339,"349":349,"46":46}],280:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],281:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],282:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"292":292,"308":308,"314":314,"49":49}],283:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"290":290,"312":312,"50":50}],284:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"283":283,"51":51}],285:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],286:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],287:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"327":327,"328":328,"334":334,"335":335,"54":54}],288:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"313":313,"55":55}],289:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"288":288,"350":350,"56":56}],290:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"288":288,"349":349,"57":57}],291:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"336":336,"58":58}],292:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"321":321,"59":59}],293:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"294":294,"60":60}],294:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"318":318,"319":319,"320":320,"335":335,"341":341,"61":61}],295:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],296:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"293":293,"63":63}],297:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"283":283,"64":64}],298:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"296":296,"329":329,"333":333,"349":349,"356":356,"65":65}],299:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"293":293,"329":329,"333":333,"66":66}],300:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],301:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],302:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],303:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],304:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"292":292,"308":308,"314":314,"71":71}],305:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],306:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"357":357,"73":73}],307:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"337":337,"356":356,"74":74}],308:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"339":339,"75":75}],309:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"339":339,"76":76}],310:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"280":280,"77":77}],311:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"306":306,"326":326,"78":78}],312:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"327":327,"333":333,"79":79}],313:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"333":333,"80":80}],314:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"270":270,"337":337,"356":356,"81":81}],315:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"278":278,"285":285,"286":286,"335":335,"82":82}],316:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"278":278,"285":285,"83":83}],317:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"306":306,"335":335,"84":84}],318:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],319:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],320:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"349":349,"87":87}],321:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],322:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],323:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"307":307,"90":90}],324:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],325:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],326:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"325":325,"327":327,"339":339,"93":93}],327:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],328:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],329:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"339":339,"96":96}],330:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"333":333,"97":97}],331:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"289":289,"98":98}],332:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"325":325,"327":327,"334":334,"335":335,"350":350,"355":355,"99":99}],333:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"339":339}],334:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"327":327,"328":328}],335:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"327":327,"328":328,"337":337}],336:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"295":295,"337":337}],337:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"328":328,"354":354}],338:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],339:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],340:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"328":328}],341:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"327":327,"328":328}],342:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],343:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"271":271,"327":327,"353":353}],344:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"277":277,"311":311}],345:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"269":269,"276":276,"344":344}],346:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"290":290,"316":316}],347:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"291":291,"350":350}],348:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],349:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"327":327,"332":332,"337":337,"339":339}],350:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"325":325,"327":327,"334":334,"335":335,"339":339,"355":355}],351:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"269":269,"274":274,"282":282,"287":287,"306":306,"330":330,"331":331,"350":350}],352:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"269":269,"287":287,"306":306,"330":330,"331":331}],353:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"305":305,"349":349}],354:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"303":303}],355:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],356:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],357:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],358:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"279":279,"298":298}],359:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],360:[function(require,module,exports){
'use strict';

var when = require(362);
var NotFoundError = require(365);

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
      var listener;

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

},{"362":362,"365":365}],361:[function(require,module,exports){
'use strict';

var constants = require(363);

module.exports = constants(['PENDING', 'FAILED', 'DONE', 'FETCH_FAILED']);

},{"363":363}],362:[function(require,module,exports){
'use strict';

var log = require(366);
var _ = require(368);
var StatusConstants = require(361);

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

  try {
    switch (this.status) {
      case StatusConstants.PENDING.toString():
        return handler.call(new WhenContext());
      case StatusConstants.FAILED.toString():
        return handler.call(new WhenContext(), this.error);
      case StatusConstants.DONE.toString():
        return handler.call(new WhenContext(), this.result);
      default:
        throw new Error('Unknown fetch result status');
    }
  } catch (e) {
    var errorMessage = 'An error occured when handling the DONE state of ';

    if (this.id) {
      errorMessage += 'the fetch \'' + this.id + '\'';
    } else {
      errorMessage += 'a fetch';
    }

    if (this.store) {
      errorMessage += ' from the store ' + this.store;
    }

    log.error(errorMessage, e);

    throw e;
  }

  function WhenContext() {
    _.extend(this, handlers);
  }
}

function join() {
  var parentContext;
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
    status: StatusConstants.FAILED.toString()
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
    var status = fetchResults[i].status;

    if (status === StatusConstants.FAILED.toString() || status === StatusConstants.PENDING.toString()) {
      return status;
    }
  }

  return StatusConstants.DONE.toString();
}

module.exports = when;
/* fetchResults, handlers */

},{"361":361,"366":366,"368":368}],363:[function(require,module,exports){
'use strict';

var log = require(366);
var _ = require(368);
var warnings = require(369);

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
        constants[type] = createActionCreator(type);
      });
    });

    return constants;
  }

  function createActionCreator(actionType) {
    var constantActionCreator = function constantActionCreator(actionCreator) {
      if (warnings.invokeConstant) {
        log.warn('Warning: Invoking constants has been depreciated. ' + 'Please migrate to new style of creating action creators ' + 'http://martyjs.org/guides/action-creators/migrating-from-v8.html');
      }

      if (!_.isFunction(actionCreator)) {
        actionCreator = autoDispatch;
      }

      return function () {
        var context = actionContext(this);

        actionCreator.apply(context, arguments);

        function actionContext(creators) {
          return _.extend({}, creators, {
            dispatch: function dispatch() {
              var args = _.toArray(arguments);

              args.unshift(actionType);

              creators.dispatch.apply(creators, args);
            }
          });
        }
      };

      function autoDispatch() {
        this.dispatch.apply(this, arguments);
      }
    };

    constantActionCreator.type = actionType;
    constantActionCreator.isActionCreator = true;
    constantActionCreator.toString = function () {
      return actionType;
    };

    return constantActionCreator;
  }
}

module.exports = constants;

},{"366":366,"368":368,"369":369}],364:[function(require,module,exports){
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

},{}],365:[function(require,module,exports){
'use strict';

function NotFoundError(message) {
  this.name = 'Not found';
  this.message = message || 'Not found';
  this.status = 404;
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;

},{}],366:[function(require,module,exports){
'use strict';

var _ = require(367);
var Diagnostics = require(364);

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

},{"364":364,"367":367}],367:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(393),
  bind: require(424),
  defaults: require(463),
  each: require(381),
  extend: require(462),
  find: require(380),
  findKey: require(464),
  first: require(373),
  rest: require(376),
  has: require(466),
  initial: require(374),
  isArray: require(453),
  isFunction: require(413),
  isNull: require(456),
  isObject: require(457),
  isString: require(458),
  isUndefined: require(460),
  last: require(375),
  map: require(383),
  matches: require(476),
  noop: require(477),
  object: require(378),
  omit: require(469),
  pick: require(470),
  toArray: require(461),
  union: require(377),
  values: require(471),
  once: require(386),
  filter: require(379),
  invoke: require(382),
  sortBy: require(384),
  functions: require(465),
  difference: require(370) };

},{"370":370,"373":373,"374":374,"375":375,"376":376,"377":377,"378":378,"379":379,"380":380,"381":381,"382":382,"383":383,"384":384,"386":386,"393":393,"413":413,"424":424,"453":453,"456":456,"457":457,"458":458,"460":460,"461":461,"462":462,"463":463,"464":464,"465":465,"466":466,"469":469,"470":470,"471":471,"476":476,"477":477}],368:[function(require,module,exports){
'use strict';

module.exports = require(367);

},{"367":367}],369:[function(require,module,exports){
'use strict';

var _ = require(367);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"367":367}],370:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"387":387,"400":400,"405":405,"452":452,"453":453}],371:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"419":419,"444":444}],372:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"419":419,"444":444}],373:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],374:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"372":372}],375:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],376:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"371":371}],377:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"387":387,"405":405,"422":422}],378:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"453":453}],379:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"28":28,"391":391,"396":396,"402":402,"453":453}],380:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"29":29,"401":401,"433":433}],381:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"30":30,"390":390,"401":401,"435":435}],382:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"31":31,"387":387,"401":401,"445":445}],383:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"32":32,"392":392,"396":396,"415":415,"453":453}],384:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"33":33,"396":396,"401":401,"420":420,"428":428,"444":444,"445":445}],385:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],386:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"35":35,"385":385}],387:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],388:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"37":37,"427":427,"455":455}],389:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],390:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],391:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],392:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],393:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],394:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],395:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"399":399,"44":44,"467":467}],396:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"416":416,"417":417,"418":418,"424":424,"45":45,"475":475}],397:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"389":389,"390":390,"399":399,"408":408,"440":440,"441":441,"442":442,"453":453,"457":457,"46":46,"467":467}],398:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],399:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],400:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"410":410,"426":426,"432":432,"49":49}],401:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"408":408,"430":430,"50":50}],402:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"401":401,"51":51}],403:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],404:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],405:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"445":445,"446":446,"452":452,"453":453,"54":54}],406:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"431":431,"55":55}],407:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"406":406,"468":468,"56":56}],408:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"406":406,"467":467,"57":57}],409:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"454":454,"58":58}],410:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"439":439,"59":59}],411:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"412":412,"60":60}],412:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"436":436,"437":437,"438":438,"453":453,"459":459,"61":61}],413:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],414:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"411":411,"63":63}],415:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"401":401,"64":64}],416:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"414":414,"447":447,"451":451,"467":467,"474":474,"65":65}],417:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"411":411,"447":447,"451":451,"66":66}],418:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],419:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],420:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],421:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],422:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"410":410,"426":426,"432":432,"71":71}],423:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],424:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"475":475,"73":73}],425:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"455":455,"474":474,"74":74}],426:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"457":457,"75":75}],427:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"457":457,"76":76}],428:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"398":398,"77":77}],429:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"424":424,"444":444,"78":78}],430:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"445":445,"451":451,"79":79}],431:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"451":451,"80":80}],432:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"388":388,"455":455,"474":474,"81":81}],433:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"396":396,"403":403,"404":404,"453":453,"82":82}],434:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"396":396,"403":403,"83":83}],435:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"424":424,"453":453,"84":84}],436:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],437:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],438:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"467":467,"87":87}],439:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],440:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],441:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"425":425,"90":90}],442:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],443:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],444:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"443":443,"445":445,"457":457,"93":93}],445:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],446:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],447:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"457":457,"96":96}],448:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"451":451,"97":97}],449:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"407":407,"98":98}],450:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"443":443,"445":445,"452":452,"453":453,"468":468,"473":473,"99":99}],451:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"457":457}],452:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"445":445,"446":446}],453:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"445":445,"446":446,"455":455}],454:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"413":413,"455":455}],455:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"446":446,"472":472}],456:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],457:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],458:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"446":446}],459:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"445":445,"446":446}],460:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],461:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"389":389,"445":445,"471":471}],462:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"395":395,"429":429}],463:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"387":387,"394":394,"462":462}],464:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"408":408,"434":434}],465:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"409":409,"468":468}],466:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],467:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"445":445,"450":450,"455":455,"457":457}],468:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"443":443,"445":445,"452":452,"453":453,"457":457,"473":473}],469:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"387":387,"392":392,"400":400,"405":405,"424":424,"448":448,"449":449,"468":468}],470:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"387":387,"405":405,"424":424,"448":448,"449":449}],471:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"423":423,"467":467}],472:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"421":421}],473:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],474:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],475:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],476:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"397":397,"416":416}],477:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],478:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var cookieFactory = defaultCookieFactory;
var StateSource = require(485);

var CookieStateSource = (function (_StateSource) {
  function CookieStateSource(options) {
    _classCallCheck(this, CookieStateSource);

    _get(Object.getPrototypeOf(CookieStateSource.prototype), 'constructor', this).call(this, options);
    this._isCookieStateSource = true;
    this._cookies = cookieFactory(this.context);
  }

  _inherits(CookieStateSource, _StateSource);

  _createClass(CookieStateSource, [{
    key: 'get',
    value: function get(key) {
      return this._cookies.get(key);
    }
  }, {
    key: 'set',
    value: function set(key, value, options) {
      return this._cookies.set(key, value, options);
    }
  }, {
    key: 'expire',
    value: function expire(key) {
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
  return require(480);
}

module.exports = CookieStateSource;

},{"480":480,"485":485}],479:[function(require,module,exports){
'use strict';

var CookieStateSource = require(478);

module.exports = function (marty) {
  marty.registerStateSource('CookieStateSource', 'cookie', CookieStateSource);
};

},{"478":478}],480:[function(require,module,exports){
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
},{}],481:[function(require,module,exports){
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

},{}],482:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],483:[function(require,module,exports){
'use strict';

var _ = require(484);
var Diagnostics = require(481);

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

},{"481":481,"484":484}],484:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(514),
  bind: require(545),
  defaults: require(584),
  each: require(502),
  extend: require(583),
  find: require(501),
  findKey: require(585),
  first: require(494),
  rest: require(497),
  has: require(587),
  initial: require(495),
  isArray: require(574),
  isFunction: require(534),
  isNull: require(577),
  isObject: require(578),
  isString: require(579),
  isUndefined: require(581),
  last: require(496),
  map: require(504),
  matches: require(597),
  noop: require(598),
  object: require(499),
  omit: require(590),
  pick: require(591),
  toArray: require(582),
  union: require(498),
  values: require(592),
  once: require(507),
  filter: require(500),
  invoke: require(503),
  sortBy: require(505),
  functions: require(586),
  difference: require(491) };

},{"491":491,"494":494,"495":495,"496":496,"497":497,"498":498,"499":499,"500":500,"501":501,"502":502,"503":503,"504":504,"505":505,"507":507,"514":514,"534":534,"545":545,"574":574,"577":577,"578":578,"579":579,"581":581,"582":582,"583":583,"584":584,"585":585,"586":586,"587":587,"590":590,"591":591,"592":592,"597":597,"598":598}],485:[function(require,module,exports){
'use strict';

module.exports = require(486);

},{"486":486}],486:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(483);
var uuid = require(489);
var warnings = require(490);
var resolve = require(488);
var Environment = require(482);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__type = 'StateSource';
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"482":482,"483":483,"488":488,"489":489,"490":490}],487:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],488:[function(require,module,exports){
'use strict';

var log = require(483);
var warnings = require(490);
var getContext = require(487);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"483":483,"487":487,"490":490}],489:[function(require,module,exports){
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

},{}],490:[function(require,module,exports){
'use strict';

var _ = require(484);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"484":484}],491:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"508":508,"521":521,"526":526,"573":573,"574":574}],492:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"540":540,"565":565}],493:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"540":540,"565":565}],494:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],495:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"493":493}],496:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],497:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"492":492}],498:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"508":508,"526":526,"543":543}],499:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"574":574}],500:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"28":28,"512":512,"517":517,"523":523,"574":574}],501:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"29":29,"522":522,"554":554}],502:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"30":30,"511":511,"522":522,"556":556}],503:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"31":31,"508":508,"522":522,"566":566}],504:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"32":32,"513":513,"517":517,"536":536,"574":574}],505:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"33":33,"517":517,"522":522,"541":541,"549":549,"565":565,"566":566}],506:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],507:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"35":35,"506":506}],508:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],509:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"37":37,"548":548,"576":576}],510:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],511:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],512:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],513:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],514:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],515:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],516:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"44":44,"520":520,"588":588}],517:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"45":45,"537":537,"538":538,"539":539,"545":545,"596":596}],518:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"46":46,"510":510,"511":511,"520":520,"529":529,"561":561,"562":562,"563":563,"574":574,"578":578,"588":588}],519:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],520:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],521:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"49":49,"531":531,"547":547,"553":553}],522:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"50":50,"529":529,"551":551}],523:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"51":51,"522":522}],524:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],525:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],526:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"54":54,"566":566,"567":567,"573":573,"574":574}],527:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"55":55,"552":552}],528:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"527":527,"56":56,"589":589}],529:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"527":527,"57":57,"588":588}],530:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"575":575,"58":58}],531:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"560":560,"59":59}],532:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"533":533,"60":60}],533:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"557":557,"558":558,"559":559,"574":574,"580":580,"61":61}],534:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],535:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"532":532,"63":63}],536:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"522":522,"64":64}],537:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"535":535,"568":568,"572":572,"588":588,"595":595,"65":65}],538:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"532":532,"568":568,"572":572,"66":66}],539:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],540:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],541:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],542:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],543:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"531":531,"547":547,"553":553,"71":71}],544:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],545:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"596":596,"73":73}],546:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"576":576,"595":595,"74":74}],547:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"578":578,"75":75}],548:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"578":578,"76":76}],549:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"519":519,"77":77}],550:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"545":545,"565":565,"78":78}],551:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"566":566,"572":572,"79":79}],552:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"572":572,"80":80}],553:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"509":509,"576":576,"595":595,"81":81}],554:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"517":517,"524":524,"525":525,"574":574,"82":82}],555:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"517":517,"524":524,"83":83}],556:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"545":545,"574":574,"84":84}],557:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],558:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],559:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"588":588,"87":87}],560:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],561:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],562:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"546":546,"90":90}],563:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],564:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],565:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"564":564,"566":566,"578":578,"93":93}],566:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],567:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],568:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"578":578,"96":96}],569:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"572":572,"97":97}],570:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"528":528,"98":98}],571:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"564":564,"566":566,"573":573,"574":574,"589":589,"594":594,"99":99}],572:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"578":578}],573:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"566":566,"567":567}],574:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"566":566,"567":567,"576":576}],575:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"534":534,"576":576}],576:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"567":567,"593":593}],577:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],578:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],579:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"567":567}],580:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"566":566,"567":567}],581:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],582:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"510":510,"566":566,"592":592}],583:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"516":516,"550":550}],584:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"508":508,"515":515,"583":583}],585:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"529":529,"555":555}],586:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"530":530,"589":589}],587:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],588:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"566":566,"571":571,"576":576,"578":578}],589:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"564":564,"566":566,"573":573,"574":574,"578":578,"594":594}],590:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"508":508,"513":513,"521":521,"526":526,"545":545,"569":569,"570":570,"589":589}],591:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"508":508,"526":526,"545":545,"569":569,"570":570}],592:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"544":544,"588":588}],593:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"542":542}],594:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],595:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],596:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],597:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"518":518,"537":537}],598:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],599:[function(require,module,exports){
'use strict';

var _ = require(607);
var uuid = require(617);

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var rollbackHandlers = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.rollback = rollback;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addRollbackHandler = addRollbackHandler;
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

  function rollback() {
    var _this = this;

    _.each(rollbackHandlers, function (rollback) {
      return rollback(_this.error);
    });
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

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = ActionPayload;

},{"607":607,"617":617}],600:[function(require,module,exports){
'use strict';

var _ = require(607);

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
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;

    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
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

},{"607":607}],601:[function(require,module,exports){
'use strict';

var _ = require(607);
var uuid = require(617);
var Dispatcher = require(620).Dispatcher;
var ActionPayload = require(599);
var EventEmitter = require(731);

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

},{"599":599,"607":607,"617":617,"620":620,"731":731}],602:[function(require,module,exports){
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

},{}],603:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],604:[function(require,module,exports){
'use strict';

var _ = require(607);
var Diagnostics = require(602);

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

},{"602":602,"607":607}],605:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _ = require(607);
var Registry = require(608);
var MartyBuilder = require(606);
var createDispatcher = require(601);

var Marty = function Marty(version, react) {
  _classCallCheck(this, Marty);

  var builder = new MartyBuilder(this);

  this.version = version;
  this.dispatcher = createDispatcher();
  this.registry = new Registry({
    defaultDispatcher: this.dispatcher
  });

  this.use = function use(cb) {
    if (!_.isFunction(cb)) {
      throw new Error('Must pass in a function');
    }

    cb(builder, react);
  };
};

module.exports = Marty;

},{"601":601,"606":606,"607":607,"608":608}],606:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var MartyBuilder = (function () {
  function MartyBuilder(marty) {
    _classCallCheck(this, MartyBuilder);

    this._marty = marty;
    this.stateSources = {};
  }

  _createClass(MartyBuilder, [{
    key: "registerStateSource",
    value: function registerStateSource(id, stateSourceId, clazz) {
      this.registerClass(id, clazz);
      this.stateSources[stateSourceId] = clazz;
    }
  }, {
    key: "registerClass",
    value: function registerClass(id, clazz) {
      this._marty[id] = clazz;
      this._marty.registry.addClass(id, clazz);
    }
  }, {
    key: "register",
    value: function register(id, value) {
      this._marty[id] = value;
    }
  }]);

  return MartyBuilder;
})();

module.exports = MartyBuilder;

},{}],607:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(646),
  bind: require(677),
  defaults: require(716),
  each: require(634),
  extend: require(715),
  find: require(633),
  findKey: require(717),
  first: require(626),
  rest: require(629),
  has: require(719),
  initial: require(627),
  isArray: require(706),
  isFunction: require(666),
  isNull: require(709),
  isObject: require(710),
  isString: require(711),
  isUndefined: require(713),
  last: require(628),
  map: require(636),
  matches: require(729),
  noop: require(730),
  object: require(631),
  omit: require(722),
  pick: require(723),
  toArray: require(714),
  union: require(630),
  values: require(724),
  once: require(639),
  filter: require(632),
  invoke: require(635),
  sortBy: require(637),
  functions: require(718),
  difference: require(623) };

},{"623":623,"626":626,"627":627,"628":628,"629":629,"630":630,"631":631,"632":632,"633":633,"634":634,"635":635,"636":636,"637":637,"639":639,"646":646,"666":666,"677":677,"706":706,"709":709,"710":710,"711":711,"713":713,"714":714,"715":715,"716":716,"717":717,"718":718,"719":719,"722":722,"723":723,"724":724,"729":729,"730":730}],608:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _ = require(607);
var log = require(604);
var warnings = require(618);
var classId = require(612);
var Environment = require(603);
var humanStrings = require(615);

var FUNCTIONS_TO_NOT_WRAP = ['fetch'];

var Registry = (function () {
  function Registry(options) {
    _classCallCheck(this, Registry);

    this.types = {};
    this.classes = {};
    this.defaults = {};
    this.defaultDispatcher = options.defaultDispatcher;
  }

  _createClass(Registry, [{
    key: 'addClass',
    value: function addClass(id, clazz) {
      this.classes[id] = clazz;
      addClassHelper(this, id);
    }
  }, {
    key: 'getClassId',
    value: function getClassId(obj) {
      var id = _.findKey(this.classes, function (type) {
        return obj instanceof type;
      });

      if (!id) {
        throw new Error('Unknown type');
      }

      return id;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.types = {};
    }
  }, {
    key: 'get',
    value: function get(type, id) {
      return (this.types[type] || {})[id];
    }
  }, {
    key: 'getAll',
    value: function getAll(type) {
      return _.values(this.types[type] || {});
    }
  }, {
    key: 'getDefault',
    value: function getDefault(type, id) {
      return this.defaults[type][id];
    }
  }, {
    key: 'getAllDefaults',
    value: function getAllDefaults(type) {
      return _.values(this.defaults[type]);
    }
  }, {
    key: 'register',
    value: function register(clazz) {
      var defaultInstance = new clazz({
        dispatcher: this.defaultDispatcher
      });
      var type = this.getClassId(defaultInstance);

      defaultInstance.__isDefaultInstance = true;

      if (!this.types[type]) {
        this.types[type] = {};
      }

      if (!this.defaults[type]) {
        this.defaults[type] = {};
      }

      var id = classId(clazz, type);

      if (!id) {
        throw CannotRegisterClassError(clazz, type);
      }

      if (this.types[type][id]) {
        throw ClassAlreadyRegisteredWithId(clazz, type);
      }

      clazz.id = id;
      defaultInstance.id = defaultInstance.id || id;
      defaultInstance.type = clazz.type = type;

      this.types[type][id] = clazz;

      if (Environment.isServer) {
        _.each(_.functions(defaultInstance), wrapResolverFunctions, defaultInstance);
      }

      this.defaults[type][id] = defaultInstance;

      return defaultInstance;
    }
  }, {
    key: 'resolve',
    value: function resolve(type, id, options) {
      var clazz = (this.types[type] || {})[id];

      if (!clazz) {
        throw CannotFindTypeWithId(type, id);
      }

      return new clazz(options);
    }
  }]);

  return Registry;
})();

module.exports = Registry;

function wrapResolverFunctions(functionName) {
  if (FUNCTIONS_TO_NOT_WRAP.indexOf(functionName) !== -1) {
    return;
  }

  var instance = this;
  var originalFunc = instance[functionName];

  instance[functionName] = function () {
    if (warnings.callingResolverOnServer && Environment.isServer) {
      var type = instance.__type;
      var displayName = instance.displayName || instance.id;
      var warningMessage = 'Warning: You are calling `' + functionName + '` on the static instance of the ' + type + ' ' + ('\'' + displayName + '\'. You should resolve the instance for the current context');

      log.warn(warningMessage);
    }

    return originalFunc.apply(instance, arguments);
  };
}

function addClassHelper(registry, classId) {
  var pluralClassId = classId;

  if (pluralClassId[pluralClassId.length - 1] !== 's') {
    pluralClassId += 's';
  }

  registry['get' + classId] = partial(registry.get, classId);
  registry['resolve' + classId] = partial(registry.resolve, classId);
  registry['getAll' + pluralClassId] = partial(registry.getAll, classId);
  registry['getDefault' + classId] = partial(registry.getDefault, classId);
  registry['getAllDefault' + pluralClassId] = partial(registry.getAllDefaults, classId);

  function partial(func, type) {
    return function () {
      var args = _.toArray(arguments);
      args.unshift(type);
      return func.apply(this, args);
    };
  }
}

function CannotFindTypeWithId(type, id) {
  return new Error('Could not find ' + type + ' with Id ' + id);
}

function CannotRegisterClassError(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = 'Cannot register the ' + typeDisplayName;

  if (displayName) {
    warningPrefix += ' \'' + displayName + '\'';
  }

  return new Error('' + warningPrefix + ' because it does not have an Id');
}

function ClassAlreadyRegisteredWithId(clazz, type) {
  var displayName = clazz.displayName || clazz.id;
  var typeDisplayName = humanStrings[type] || type;
  var warningPrefix = 'Cannot register the ' + typeDisplayName;

  if (displayName) {
    warningPrefix += ' \'' + displayName + '\'';
  }

  return new Error('' + warningPrefix + ' because there is already a class with that Id.');
}

},{"603":603,"604":604,"607":607,"612":612,"615":615,"618":618}],609:[function(require,module,exports){
'use strict';

var _ = require(607);
var createClass = require(600);

function createStateSourceClass(properties, baseType) {
  properties = properties || {};

  var merge = [{}, properties].concat(properties.mixins || []);

  properties = _.extend.apply(_, merge);

  return createClass(properties, properties, baseType);
}

module.exports = createStateSourceClass;

},{"600":600,"607":607}],610:[function(require,module,exports){
'use strict';

module.exports = require(611);

},{"611":611}],611:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(604);
var uuid = require(617);
var warnings = require(618);
var resolve = require(616);
var Environment = require(603);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__type = 'StateSource';
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"603":603,"604":604,"616":616,"617":617,"618":618}],612:[function(require,module,exports){
'use strict';

var uuid = require(617);
var log = require(604);
var warnings = require(618);
var humanStrings = require(615);

function classId(clazz, type) {
  if (clazz.id) {
    return clazz.id;
  }

  var displayName = '';

  if (clazz.displayName) {
    displayName = '\'' + clazz.displayName + '\' ';
  }

  var typeDisplayName = humanStrings[type] || type;

  if (warnings.classDoesNotHaveAnId) {
    log.warn('Warning: The ' + typeDisplayName + ' ' + displayName + 'does not have an Id');
  }

  return clazz.displayName || uuid.generate();
}

module.exports = classId;

},{"604":604,"615":615,"617":617,"618":618}],613:[function(require,module,exports){
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

},{}],614:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],615:[function(require,module,exports){
'use strict';

module.exports = {
  Store: 'store',
  StateSource: 'state source',
  ActionCreators: 'action creators'
};

},{}],616:[function(require,module,exports){
'use strict';

var log = require(604);
var warnings = require(618);
var getContext = require(614);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"604":604,"614":614,"618":618}],617:[function(require,module,exports){
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

},{}],618:[function(require,module,exports){
'use strict';

var _ = require(607);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"607":607}],619:[function(require,module,exports){
'use strict';

var _ = require(607);
var logger = require(604);
var warnings = require(618);
var diagnostics = require(602);
var environment = require(603);
var StateSource = require(610);
var getClassName = require(613);
var createStateSourceClass = require(609);

module.exports = function (marty) {
  marty.registerClass('StateSource', StateSource);

  marty.register('logger', logger);
  marty.register('dispose', dispose);
  marty.register('warnings', warnings);
  marty.register('register', register);
  marty.register('diagnostics', diagnostics);
  marty.register('createStateSource', createStateSource);

  _.each(environment, function (value, key) {
    marty.register(key, value);
  });

  function dispose() {
    this.registry.dispose();
    this.dispatcher.dispose();
  }

  function createStateSource(properties) {
    var BaseType = properties.type ? marty.stateSources[properties.type] : StateSource;

    if (!BaseType) {
      throw new Error('Unknown state source ' + properties.type);
    }

    var StateSourceClass = createStateSourceClass(properties, BaseType);
    var defaultInstance = this.register(StateSourceClass);

    return defaultInstance;
  }

  function register(clazz, id) {
    var className = getClassName(clazz);

    if (!clazz.id) {
      clazz.id = id || className;
    }

    if (!clazz.displayName) {
      clazz.displayName = clazz.id;
    }

    return this.registry.register(clazz);
  }
};

},{"602":602,"603":603,"604":604,"607":607,"609":609,"610":610,"613":613,"618":618}],620:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require(621)

},{"621":621}],621:[function(require,module,exports){
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

var invariant = require(622);

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

},{"622":622}],622:[function(require,module,exports){
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

},{}],623:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"640":640,"653":653,"658":658,"705":705,"706":706}],624:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"672":672,"697":697}],625:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"672":672,"697":697}],626:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],627:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"625":625}],628:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],629:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"624":624}],630:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"640":640,"658":658,"675":675}],631:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"706":706}],632:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"28":28,"644":644,"649":649,"655":655,"706":706}],633:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"29":29,"654":654,"686":686}],634:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"30":30,"643":643,"654":654,"688":688}],635:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"31":31,"640":640,"654":654,"698":698}],636:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"32":32,"645":645,"649":649,"668":668,"706":706}],637:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"33":33,"649":649,"654":654,"673":673,"681":681,"697":697,"698":698}],638:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],639:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"35":35,"638":638}],640:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],641:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"37":37,"680":680,"708":708}],642:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],643:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],644:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],645:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],646:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],647:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],648:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"44":44,"652":652,"720":720}],649:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"45":45,"669":669,"670":670,"671":671,"677":677,"728":728}],650:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"46":46,"642":642,"643":643,"652":652,"661":661,"693":693,"694":694,"695":695,"706":706,"710":710,"720":720}],651:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],652:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],653:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"49":49,"663":663,"679":679,"685":685}],654:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"50":50,"661":661,"683":683}],655:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"51":51,"654":654}],656:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],657:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],658:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"54":54,"698":698,"699":699,"705":705,"706":706}],659:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"55":55,"684":684}],660:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"56":56,"659":659,"721":721}],661:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"57":57,"659":659,"720":720}],662:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"58":58,"707":707}],663:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"59":59,"692":692}],664:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"60":60,"665":665}],665:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"61":61,"689":689,"690":690,"691":691,"706":706,"712":712}],666:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],667:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"63":63,"664":664}],668:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"64":64,"654":654}],669:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"65":65,"667":667,"700":700,"704":704,"720":720,"727":727}],670:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"66":66,"664":664,"700":700,"704":704}],671:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],672:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],673:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],674:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],675:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"663":663,"679":679,"685":685,"71":71}],676:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],677:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"728":728,"73":73}],678:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"708":708,"727":727,"74":74}],679:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"710":710,"75":75}],680:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"710":710,"76":76}],681:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"651":651,"77":77}],682:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"677":677,"697":697,"78":78}],683:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"698":698,"704":704,"79":79}],684:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"704":704,"80":80}],685:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"641":641,"708":708,"727":727,"81":81}],686:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"649":649,"656":656,"657":657,"706":706,"82":82}],687:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"649":649,"656":656,"83":83}],688:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"677":677,"706":706,"84":84}],689:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],690:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],691:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"720":720,"87":87}],692:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],693:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],694:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"678":678,"90":90}],695:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],696:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],697:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"696":696,"698":698,"710":710,"93":93}],698:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],699:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],700:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"710":710,"96":96}],701:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"704":704,"97":97}],702:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"660":660,"98":98}],703:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"696":696,"698":698,"705":705,"706":706,"721":721,"726":726,"99":99}],704:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"710":710}],705:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"698":698,"699":699}],706:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"698":698,"699":699,"708":708}],707:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"666":666,"708":708}],708:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"699":699,"725":725}],709:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],710:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],711:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"699":699}],712:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"698":698,"699":699}],713:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],714:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"642":642,"698":698,"724":724}],715:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"648":648,"682":682}],716:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"640":640,"647":647,"715":715}],717:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"661":661,"687":687}],718:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"662":662,"721":721}],719:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],720:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"698":698,"703":703,"708":708,"710":710}],721:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"696":696,"698":698,"705":705,"706":706,"710":710,"726":726}],722:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"640":640,"645":645,"653":653,"658":658,"677":677,"701":701,"702":702,"721":721}],723:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"640":640,"658":658,"677":677,"701":701,"702":702}],724:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"676":676,"720":720}],725:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"674":674}],726:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],727:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],728:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],729:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"650":650,"669":669}],730:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],731:[function(require,module,exports){
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

},{}],732:[function(require,module,exports){
'use strict';

module.exports = {
  id: 'includeCredentials',
  before: function before(req) {
    // Enable sending Cookies for authentication.
    // Ref: https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    req.credentials = 'same-origin';
  }
};

},{}],733:[function(require,module,exports){
'use strict';

var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';
var _ = require(740);

module.exports = {
  id: 'parseJSON',
  after: function after(res) {
    if (isJson(res)) {
      return res.json().then(function (body) {
        res.body = body;

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

},{"740":740}],734:[function(require,module,exports){
'use strict';

var CONTENT_TYPE = 'Content-Type';
var JSON_CONTENT_TYPE = 'application/json';
var _ = require(740);

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

},{"740":740}],735:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var hooks = {};
var log = require(739);
var _ = require(740);
var StateSource = require(741);
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
      if (hook) {
        if (_.isUndefined(hook.priority)) {
          hook.priority = Object.keys(hooks).length;
        }

        hooks[hook.id] = hook;
      }
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
    get: function () {
      return '';
    }
  }]);

  return HttpStateSource;
})(StateSource);

HttpStateSource.addHook(require(733));
HttpStateSource.addHook(require(734));
HttpStateSource.addHook(require(732));

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

  options.method = method.toLowerCase();

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
      options.headers.Accept = contentType;
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
  var current;

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

},{"732":732,"733":733,"734":734,"739":739,"740":740,"741":741}],736:[function(require,module,exports){
'use strict';

var HttpStateSource = require(735);

module.exports = function (marty) {
  marty.registerStateSource('HttpStateSource', 'http', HttpStateSource);
};

},{"735":735}],737:[function(require,module,exports){
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

},{}],738:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],739:[function(require,module,exports){
'use strict';

var _ = require(740);
var Diagnostics = require(737);

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

},{"737":737,"740":740}],740:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(770),
  bind: require(801),
  defaults: require(840),
  each: require(758),
  extend: require(839),
  find: require(757),
  findKey: require(841),
  first: require(750),
  rest: require(753),
  has: require(843),
  initial: require(751),
  isArray: require(830),
  isFunction: require(790),
  isNull: require(833),
  isObject: require(834),
  isString: require(835),
  isUndefined: require(837),
  last: require(752),
  map: require(760),
  matches: require(853),
  noop: require(854),
  object: require(755),
  omit: require(846),
  pick: require(847),
  toArray: require(838),
  union: require(754),
  values: require(848),
  once: require(763),
  filter: require(756),
  invoke: require(759),
  sortBy: require(761),
  functions: require(842),
  difference: require(747) };

},{"747":747,"750":750,"751":751,"752":752,"753":753,"754":754,"755":755,"756":756,"757":757,"758":758,"759":759,"760":760,"761":761,"763":763,"770":770,"790":790,"801":801,"830":830,"833":833,"834":834,"835":835,"837":837,"838":838,"839":839,"840":840,"841":841,"842":842,"843":843,"846":846,"847":847,"848":848,"853":853,"854":854}],741:[function(require,module,exports){
'use strict';

module.exports = require(742);

},{"742":742}],742:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(739);
var uuid = require(745);
var warnings = require(746);
var resolve = require(744);
var Environment = require(738);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__type = 'StateSource';
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"738":738,"739":739,"744":744,"745":745,"746":746}],743:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],744:[function(require,module,exports){
'use strict';

var log = require(739);
var warnings = require(746);
var getContext = require(743);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"739":739,"743":743,"746":746}],745:[function(require,module,exports){
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

},{}],746:[function(require,module,exports){
'use strict';

var _ = require(740);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"740":740}],747:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"764":764,"777":777,"782":782,"829":829,"830":830}],748:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"796":796,"821":821}],749:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"796":796,"821":821}],750:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],751:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"749":749}],752:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],753:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"748":748}],754:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"764":764,"782":782,"799":799}],755:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"830":830}],756:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"28":28,"768":768,"773":773,"779":779,"830":830}],757:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"29":29,"778":778,"810":810}],758:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"30":30,"767":767,"778":778,"812":812}],759:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"31":31,"764":764,"778":778,"822":822}],760:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"32":32,"769":769,"773":773,"792":792,"830":830}],761:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"33":33,"773":773,"778":778,"797":797,"805":805,"821":821,"822":822}],762:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],763:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"35":35,"762":762}],764:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],765:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"37":37,"804":804,"832":832}],766:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],767:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],768:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],769:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],770:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],771:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],772:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"44":44,"776":776,"844":844}],773:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"45":45,"793":793,"794":794,"795":795,"801":801,"852":852}],774:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"46":46,"766":766,"767":767,"776":776,"785":785,"817":817,"818":818,"819":819,"830":830,"834":834,"844":844}],775:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],776:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],777:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"49":49,"787":787,"803":803,"809":809}],778:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"50":50,"785":785,"807":807}],779:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"51":51,"778":778}],780:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],781:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],782:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"54":54,"822":822,"823":823,"829":829,"830":830}],783:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"55":55,"808":808}],784:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"56":56,"783":783,"845":845}],785:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"57":57,"783":783,"844":844}],786:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"58":58,"831":831}],787:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"59":59,"816":816}],788:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"60":60,"789":789}],789:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"61":61,"813":813,"814":814,"815":815,"830":830,"836":836}],790:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],791:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"63":63,"788":788}],792:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"64":64,"778":778}],793:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"65":65,"791":791,"824":824,"828":828,"844":844,"851":851}],794:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"66":66,"788":788,"824":824,"828":828}],795:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],796:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],797:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],798:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],799:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"71":71,"787":787,"803":803,"809":809}],800:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],801:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"73":73,"852":852}],802:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"74":74,"832":832,"851":851}],803:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"75":75,"834":834}],804:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"76":76,"834":834}],805:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"77":77,"775":775}],806:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"78":78,"801":801,"821":821}],807:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"79":79,"822":822,"828":828}],808:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"80":80,"828":828}],809:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"765":765,"81":81,"832":832,"851":851}],810:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"773":773,"780":780,"781":781,"82":82,"830":830}],811:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"773":773,"780":780,"83":83}],812:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"801":801,"830":830,"84":84}],813:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],814:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],815:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"844":844,"87":87}],816:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],817:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],818:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"802":802,"90":90}],819:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],820:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],821:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"820":820,"822":822,"834":834,"93":93}],822:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],823:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],824:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"834":834,"96":96}],825:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"828":828,"97":97}],826:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"784":784,"98":98}],827:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"820":820,"822":822,"829":829,"830":830,"845":845,"850":850,"99":99}],828:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"834":834}],829:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"822":822,"823":823}],830:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"822":822,"823":823,"832":832}],831:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"790":790,"832":832}],832:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"823":823,"849":849}],833:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],834:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],835:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"823":823}],836:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"822":822,"823":823}],837:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],838:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"766":766,"822":822,"848":848}],839:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"772":772,"806":806}],840:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"764":764,"771":771,"839":839}],841:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"785":785,"811":811}],842:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"786":786,"845":845}],843:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],844:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"822":822,"827":827,"832":832,"834":834}],845:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"820":820,"822":822,"829":829,"830":830,"834":834,"850":850}],846:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"764":764,"769":769,"777":777,"782":782,"801":801,"825":825,"826":826,"845":845}],847:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"764":764,"782":782,"801":801,"825":825,"826":826}],848:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"800":800,"844":844}],849:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"798":798}],850:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],851:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],852:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],853:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"774":774,"793":793}],854:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],855:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _ = require(861);
var uuid = require(864);
var timeout = require(863);
var deferred = require(862);
var FetchDiagnostics = require(856);
var createDispatcher = require(860);

var DEFAULT_TIMEOUT = 1000;

var Context = (function () {
  function Context(registry) {
    var _this = this;

    _classCallCheck(this, Context);

    this.instances = {};
    this.__isContext = true;
    this.id = uuid.type('Context');
    this.dispatcher = createDispatcher();

    _.each((registry || {}).types, function (classes, type) {
      var options = {
        context: _this,
        dispatcher: _this.dispatcher
      };

      _this.instances[type] = {};

      _.each(classes, function (clazz) {
        _this.instances[type][clazz.id] = registry.resolve(type, clazz.id, options);
      });
    });
  }

  _createClass(Context, [{
    key: 'fetch',
    value: function fetch(cb, options) {
      var _this2 = this;

      var fetchDone;

      options = _.defaults(options || {}, {
        timeout: DEFAULT_TIMEOUT
      });

      this.__deferredFetchDone = deferred();
      this.__diagnostics = new FetchDiagnostics();
      fetchDone = this.__deferredFetchDone.promise;

      try {
        cb.call(this);
      } catch (e) {
        this.__deferredFetchDone.reject(e);

        return fetchDone;
      }

      if (!this.__diagnostics.hasPendingFetches) {
        this.__deferredFetchDone.resolve();
      }

      return Promise.race([fetchDone, timeout(options.timeout)]).then(function () {
        return _this2.__diagnostics.toJSON();
      });
    }
  }, {
    key: 'fetchStarted',
    value: function fetchStarted(storeId, fetchId) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchStarted(storeId, fetchId);
    }
  }, {
    key: 'fetchDone',
    value: function fetchDone(storeId, fetchId, status, options) {
      var diagnostics = this.__diagnostics;

      diagnostics.fetchDone(storeId, fetchId, status, options);

      if (!diagnostics.hasPendingFetches) {
        this.__deferredFetchDone.resolve();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _.each(this.instances, function (instances) {
        _.each(instances, function (instance) {
          if (_.isFunction(instance.dispose)) {
            instance.dispose();
          }
        });
      });

      this.instances = null;
      this.dispatcher = null;
    }
  }, {
    key: 'resolve',
    value: function resolve(obj) {
      if (!obj.constructor) {
        throw new Error('Cannot resolve object');
      }

      var id = obj.constructor.id;
      var type = obj.constructor.type;

      if (!this.instances[type]) {
        throw new Error('Context does not have any instances of ' + type);
      }

      if (!this.instances[type][id]) {
        throw new Error('Context does not have an instance of the ' + type + ' id');
      }

      return this.instances[type][id];
    }
  }, {
    key: 'getAll',
    value: function getAll(type) {
      return _.values(this.instances[type]);
    }
  }, {
    key: 'getAllStores',
    value: function getAllStores() {
      return this.getAll('Store');
    }
  }, {
    key: 'getAllStateSources',
    value: function getAllStateSources() {
      return this.getAll('StateSource');
    }
  }, {
    key: 'getAllActionCreators',
    value: function getAllActionCreators() {
      return this.getAll('ActionCreators');
    }
  }, {
    key: 'getAllQueries',
    value: function getAllQueries() {
      return this.getAll('Queries');
    }
  }]);

  return Context;
})();

module.exports = Context;

},{"856":856,"860":860,"861":861,"862":862,"863":863,"864":864}],856:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _ = require(861);

var FetchDiagnostics = (function () {
  function FetchDiagnostics() {
    _classCallCheck(this, FetchDiagnostics);

    this.numberOfPendingFetches = 0;
    this.fetches = [];
  }

  _createClass(FetchDiagnostics, [{
    key: 'fetchStarted',
    value: function fetchStarted(storeId, fetchId) {
      this.numberOfPendingFetches++;
      this.fetches.push({
        status: 'PENDING',
        storeId: storeId,
        fetchId: fetchId,
        startTime: new Date()
      });
    }
  }, {
    key: 'fetchDone',
    value: function fetchDone(storeId, fetchId, status, options) {
      var fetch = _.find(this.fetches, {
        storeId: storeId,
        fetchId: fetchId
      });

      if (fetch) {
        _.extend(fetch, {
          status: status,
          time: new Date() - fetch.startTime
        }, options);

        this.numberOfPendingFetches--;
      }
    }
  }, {
    key: 'hasPendingFetches',
    get: function () {
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

},{"861":861}],857:[function(require,module,exports){
'use strict';

var Context = require(855);
var _ = require(861);

// React is passed down to us so we can't require it in
module.exports = function (React) {
  return function renderToString(options) {
    options = options || {};

    var Marty = this;
    var context = options.context;
    var fetchOptions = { timeout: options.timeout };

    return new Promise(function (resolve, reject) {
      if (!options.type) {
        reject(new Error('Must pass in a React component type'));
        return;
      }

      if (!context) {
        reject(new Error('Must pass in a context'));
        return;
      }

      if (!context instanceof Context) {
        reject(new Error('context must be an instance of Context'));
        return;
      }

      startFetches().then(dehydrateAndRenderHtml);

      function dehydrateAndRenderHtml(diagnostics) {
        context.fetch(function () {
          try {
            var element = createElement();

            if (!element) {
              reject(new Error('createElement must return an element'));
              return;
            }

            var html = React.renderToString(element);
            html += dehydratedState(context);
            resolve({
              html: html,
              diagnostics: diagnostics
            });
          } catch (e) {
            reject(e);
          } finally {
            context.dispose();
          }
        }, fetchOptions);
      }

      function startFetches() {
        return context.fetch(function () {
          try {
            var element = createElement();

            if (!element) {
              reject(new Error('createElement must return an element'));
              return;
            }

            React.renderToString(element);
          } catch (e) {
            reject(e);
          }
        }, fetchOptions);
      }

      function createElement() {
        var ContextContainer = React.createClass({
          displayName: 'ContextContainer',

          childContextTypes: {
            marty: React.PropTypes.object.isRequired
          },
          getChildContext: function getChildContext() {
            return {
              marty: context
            };
          },
          render: function render() {
            var props = _.extend({}, options.props, { ref: 'subject' });

            return React.createElement(options.type, props);
          }
        });

        return React.createElement(ContextContainer);
      }

      function dehydratedState(context) {
        var state = Marty.dehydrate(context);

        return '<script id="__marty-state">' + state + '</script>';
      }
    });
  };
};

},{"855":855,"861":861}],858:[function(require,module,exports){
'use strict';

var Context = require(855);
var renderToString = require(857);

module.exports = function (marty, React) {
  marty.register('createContext', createContext);
  marty.register('renderToString', renderToString(React));

  function createContext() {
    return new Context(this.registry);
  }
};

},{"855":855,"857":857}],859:[function(require,module,exports){
'use strict';

var _ = require(861);
var uuid = require(864);

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var rollbackHandlers = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.rollback = rollback;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addRollbackHandler = addRollbackHandler;
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

  function rollback() {
    var _this = this;

    _.each(rollbackHandlers, function (rollback) {
      return rollback(_this.error);
    });
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

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = ActionPayload;

},{"861":861,"864":864}],860:[function(require,module,exports){
'use strict';

var _ = require(861);
var uuid = require(864);
var Dispatcher = require(865).Dispatcher;
var ActionPayload = require(859);
var EventEmitter = require(976);

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

},{"859":859,"861":861,"864":864,"865":865,"976":976}],861:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(891),
  bind: require(922),
  defaults: require(961),
  each: require(879),
  extend: require(960),
  find: require(878),
  findKey: require(962),
  first: require(871),
  rest: require(874),
  has: require(964),
  initial: require(872),
  isArray: require(951),
  isFunction: require(911),
  isNull: require(954),
  isObject: require(955),
  isString: require(956),
  isUndefined: require(958),
  last: require(873),
  map: require(881),
  matches: require(974),
  noop: require(975),
  object: require(876),
  omit: require(967),
  pick: require(968),
  toArray: require(959),
  union: require(875),
  values: require(969),
  once: require(884),
  filter: require(877),
  invoke: require(880),
  sortBy: require(882),
  functions: require(963),
  difference: require(868) };

},{"868":868,"871":871,"872":872,"873":873,"874":874,"875":875,"876":876,"877":877,"878":878,"879":879,"880":880,"881":881,"882":882,"884":884,"891":891,"911":911,"922":922,"951":951,"954":954,"955":955,"956":956,"958":958,"959":959,"960":960,"961":961,"962":962,"963":963,"964":964,"967":967,"968":968,"969":969,"974":974,"975":975}],862:[function(require,module,exports){
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

},{}],863:[function(require,module,exports){
"use strict";

function timeout(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

module.exports = timeout;

},{}],864:[function(require,module,exports){
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

},{}],865:[function(require,module,exports){
arguments[4][620][0].apply(exports,arguments)
},{"620":620,"866":866}],866:[function(require,module,exports){
arguments[4][621][0].apply(exports,arguments)
},{"621":621,"867":867}],867:[function(require,module,exports){
arguments[4][622][0].apply(exports,arguments)
},{"622":622}],868:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"19":19,"885":885,"898":898,"903":903,"950":950,"951":951}],869:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"20":20,"917":917,"942":942}],870:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"21":21,"917":917,"942":942}],871:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],872:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"870":870}],873:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],874:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"869":869}],875:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"26":26,"885":885,"903":903,"920":920}],876:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"27":27,"951":951}],877:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"28":28,"889":889,"894":894,"900":900,"951":951}],878:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"29":29,"899":899,"931":931}],879:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"30":30,"888":888,"899":899,"933":933}],880:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"31":31,"885":885,"899":899,"943":943}],881:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"32":32,"890":890,"894":894,"913":913,"951":951}],882:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"33":33,"894":894,"899":899,"918":918,"926":926,"942":942,"943":943}],883:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],884:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"35":35,"883":883}],885:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],886:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"37":37,"925":925,"953":953}],887:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],888:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],889:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],890:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],891:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],892:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],893:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"44":44,"897":897,"965":965}],894:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"45":45,"914":914,"915":915,"916":916,"922":922,"973":973}],895:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"46":46,"887":887,"888":888,"897":897,"906":906,"938":938,"939":939,"940":940,"951":951,"955":955,"965":965}],896:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],897:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],898:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"49":49,"908":908,"924":924,"930":930}],899:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"50":50,"906":906,"928":928}],900:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"51":51,"899":899}],901:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],902:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],903:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"54":54,"943":943,"944":944,"950":950,"951":951}],904:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"55":55,"929":929}],905:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"56":56,"904":904,"966":966}],906:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"57":57,"904":904,"965":965}],907:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"58":58,"952":952}],908:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"59":59,"937":937}],909:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"60":60,"910":910}],910:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"61":61,"934":934,"935":935,"936":936,"951":951,"957":957}],911:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],912:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"63":63,"909":909}],913:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"64":64,"899":899}],914:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"65":65,"912":912,"945":945,"949":949,"965":965,"972":972}],915:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"66":66,"909":909,"945":945,"949":949}],916:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],917:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],918:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],919:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],920:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"71":71,"908":908,"924":924,"930":930}],921:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],922:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"73":73,"973":973}],923:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"74":74,"953":953,"972":972}],924:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"75":75,"955":955}],925:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"76":76,"955":955}],926:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"77":77,"896":896}],927:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"78":78,"922":922,"942":942}],928:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"79":79,"943":943,"949":949}],929:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"80":80,"949":949}],930:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"81":81,"886":886,"953":953,"972":972}],931:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"82":82,"894":894,"901":901,"902":902,"951":951}],932:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"83":83,"894":894,"901":901}],933:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"84":84,"922":922,"951":951}],934:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],935:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],936:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"87":87,"965":965}],937:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],938:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],939:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"90":90,"923":923}],940:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],941:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],942:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"93":93,"941":941,"943":943,"955":955}],943:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],944:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],945:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"955":955,"96":96}],946:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"949":949,"97":97}],947:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"905":905,"98":98}],948:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"941":941,"943":943,"950":950,"951":951,"966":966,"971":971,"99":99}],949:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"955":955}],950:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"943":943,"944":944}],951:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"943":943,"944":944,"953":953}],952:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"911":911,"953":953}],953:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"944":944,"970":970}],954:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],955:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],956:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"944":944}],957:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"943":943,"944":944}],958:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],959:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"887":887,"943":943,"969":969}],960:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"893":893,"927":927}],961:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"885":885,"892":892,"960":960}],962:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"906":906,"932":932}],963:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"907":907,"966":966}],964:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],965:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"943":943,"948":948,"953":953,"955":955}],966:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"941":941,"943":943,"950":950,"951":951,"955":955,"971":971}],967:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"885":885,"890":890,"898":898,"903":903,"922":922,"946":946,"947":947,"966":966}],968:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"885":885,"903":903,"922":922,"946":946,"947":947}],969:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"921":921,"965":965}],970:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"919":919}],971:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],972:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],973:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],974:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"895":895,"914":914}],975:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],976:[function(require,module,exports){
arguments[4][731][0].apply(exports,arguments)
},{"731":731}],977:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var noopStorage = require(978);
var StateSource = require(984);

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
    get: function () {
      return '';
    }
  }, {
    key: 'defaultStorage',
    get: function () {
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

},{"978":978,"984":984}],978:[function(require,module,exports){
'use strict';

var _ = require(987);

module.exports = {
  getItem: _.noop,
  setItem: _.noop
};

},{"987":987}],979:[function(require,module,exports){
'use strict';

var JSONStorageStateSource = require(977);

module.exports = function (marty) {
  marty.registerStateSource('JSONStorageStateSource', 'jsonStorage', JSONStorageStateSource);
};

},{"977":977}],980:[function(require,module,exports){
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

},{}],981:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],982:[function(require,module,exports){
'use strict';

var _ = require(983);
var Diagnostics = require(980);

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

},{"980":980,"983":983}],983:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1014),
  bind: require(1045),
  defaults: require(1084),
  each: require(1002),
  extend: require(1083),
  find: require(1001),
  findKey: require(1085),
  first: require(994),
  rest: require(997),
  has: require(1087),
  initial: require(995),
  isArray: require(1074),
  isFunction: require(1034),
  isNull: require(1077),
  isObject: require(1078),
  isString: require(1079),
  isUndefined: require(1081),
  last: require(996),
  map: require(1004),
  matches: require(1097),
  noop: require(1098),
  object: require(999),
  omit: require(1090),
  pick: require(1091),
  toArray: require(1082),
  union: require(998),
  values: require(1092),
  once: require(1007),
  filter: require(1000),
  invoke: require(1003),
  sortBy: require(1005),
  functions: require(1086),
  difference: require(991) };

},{"1000":1000,"1001":1001,"1002":1002,"1003":1003,"1004":1004,"1005":1005,"1007":1007,"1014":1014,"1034":1034,"1045":1045,"1074":1074,"1077":1077,"1078":1078,"1079":1079,"1081":1081,"1082":1082,"1083":1083,"1084":1084,"1085":1085,"1086":1086,"1087":1087,"1090":1090,"1091":1091,"1092":1092,"1097":1097,"1098":1098,"991":991,"994":994,"995":995,"996":996,"997":997,"998":998,"999":999}],984:[function(require,module,exports){
'use strict';

module.exports = require(985);

},{"985":985}],985:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(982);
var uuid = require(989);
var warnings = require(990);
var resolve = require(988);
var Environment = require(981);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__type = 'StateSource';
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"981":981,"982":982,"988":988,"989":989,"990":990}],986:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],987:[function(require,module,exports){
'use strict';

module.exports = require(983);

},{"983":983}],988:[function(require,module,exports){
'use strict';

var log = require(982);
var warnings = require(990);
var getContext = require(986);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"982":982,"986":986,"990":990}],989:[function(require,module,exports){
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

},{}],990:[function(require,module,exports){
'use strict';

var _ = require(983);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"983":983}],991:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1008":1008,"1021":1021,"1026":1026,"1073":1073,"1074":1074,"19":19}],992:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1040":1040,"1065":1065,"20":20}],993:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1040":1040,"1065":1065,"21":21}],994:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],995:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"23":23,"993":993}],996:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],997:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"25":25,"992":992}],998:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1008":1008,"1026":1026,"1043":1043,"26":26}],999:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1074":1074,"27":27}],1000:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1012":1012,"1017":1017,"1023":1023,"1074":1074,"28":28}],1001:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1022":1022,"1054":1054,"29":29}],1002:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1011":1011,"1022":1022,"1056":1056,"30":30}],1003:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1008":1008,"1022":1022,"1066":1066,"31":31}],1004:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1013":1013,"1017":1017,"1036":1036,"1074":1074,"32":32}],1005:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1017":1017,"1022":1022,"1041":1041,"1049":1049,"1065":1065,"1066":1066,"33":33}],1006:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1007:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1006":1006,"35":35}],1008:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1009:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1048":1048,"1076":1076,"37":37}],1010:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1011:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1012:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1013:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1014:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1015:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1016:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1020":1020,"1088":1088,"44":44}],1017:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1037":1037,"1038":1038,"1039":1039,"1045":1045,"1096":1096,"45":45}],1018:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1010":1010,"1011":1011,"1020":1020,"1029":1029,"1061":1061,"1062":1062,"1063":1063,"1074":1074,"1078":1078,"1088":1088,"46":46}],1019:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1020:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1021:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1031":1031,"1047":1047,"1053":1053,"49":49}],1022:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1029":1029,"1051":1051,"50":50}],1023:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1022":1022,"51":51}],1024:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1025:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1026:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1066":1066,"1067":1067,"1073":1073,"1074":1074,"54":54}],1027:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1052":1052,"55":55}],1028:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1027":1027,"1089":1089,"56":56}],1029:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1027":1027,"1088":1088,"57":57}],1030:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1075":1075,"58":58}],1031:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1060":1060,"59":59}],1032:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1033":1033,"60":60}],1033:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1057":1057,"1058":1058,"1059":1059,"1074":1074,"1080":1080,"61":61}],1034:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1035:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1032":1032,"63":63}],1036:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1022":1022,"64":64}],1037:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1035":1035,"1068":1068,"1072":1072,"1088":1088,"1095":1095,"65":65}],1038:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1032":1032,"1068":1068,"1072":1072,"66":66}],1039:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1040:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1041:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1042:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1043:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1031":1031,"1047":1047,"1053":1053,"71":71}],1044:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1045:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1096":1096,"73":73}],1046:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1076":1076,"1095":1095,"74":74}],1047:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1078":1078,"75":75}],1048:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1078":1078,"76":76}],1049:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1019":1019,"77":77}],1050:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1045":1045,"1065":1065,"78":78}],1051:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1066":1066,"1072":1072,"79":79}],1052:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1072":1072,"80":80}],1053:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1009":1009,"1076":1076,"1095":1095,"81":81}],1054:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1017":1017,"1024":1024,"1025":1025,"1074":1074,"82":82}],1055:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1017":1017,"1024":1024,"83":83}],1056:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1045":1045,"1074":1074,"84":84}],1057:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1058:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1059:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1088":1088,"87":87}],1060:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1061:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1062:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1046":1046,"90":90}],1063:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1064:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1065:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1064":1064,"1066":1066,"1078":1078,"93":93}],1066:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1067:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1068:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1078":1078,"96":96}],1069:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1072":1072,"97":97}],1070:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1028":1028,"98":98}],1071:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1064":1064,"1066":1066,"1073":1073,"1074":1074,"1089":1089,"1094":1094,"99":99}],1072:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1078":1078}],1073:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1066":1066,"1067":1067}],1074:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1066":1066,"1067":1067,"1076":1076}],1075:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1034":1034,"1076":1076}],1076:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1067":1067,"1093":1093}],1077:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1078:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1079:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"1067":1067,"107":107}],1080:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"1066":1066,"1067":1067,"108":108}],1081:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1082:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"1010":1010,"1066":1066,"1092":1092,"110":110}],1083:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"1016":1016,"1050":1050,"111":111}],1084:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"1008":1008,"1015":1015,"1083":1083,"112":112}],1085:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"1029":1029,"1055":1055,"113":113}],1086:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"1030":1030,"1089":1089,"114":114}],1087:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1088:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"1066":1066,"1071":1071,"1076":1076,"1078":1078,"116":116}],1089:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"1064":1064,"1066":1066,"1073":1073,"1074":1074,"1078":1078,"1094":1094,"117":117}],1090:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"1008":1008,"1013":1013,"1021":1021,"1026":1026,"1045":1045,"1069":1069,"1070":1070,"1089":1089,"118":118}],1091:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"1008":1008,"1026":1026,"1045":1045,"1069":1069,"1070":1070,"119":119}],1092:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"1044":1044,"1088":1088,"120":120}],1093:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"1042":1042,"121":121}],1094:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1095:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1096:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1097:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"1018":1018,"1037":1037,"125":125}],1098:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1099:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var noopStorage = require(1100);
var StateSource = require(1106);

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
    get: function () {
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

},{"1100":1100,"1106":1106}],1100:[function(require,module,exports){
'use strict';

var _ = require(1109);

module.exports = {
  getItem: _.noop,
  setItem: _.noop
};

},{"1109":1109}],1101:[function(require,module,exports){
'use strict';

var LocalStorageStateSource = require(1099);

module.exports = function (marty) {
  marty.registerStateSource('LocalStorageStateSource', 'localStorage', LocalStorageStateSource);
};

},{"1099":1099}],1102:[function(require,module,exports){
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

},{}],1103:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],1104:[function(require,module,exports){
'use strict';

var _ = require(1105);
var Diagnostics = require(1102);

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

},{"1102":1102,"1105":1105}],1105:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1136),
  bind: require(1167),
  defaults: require(1206),
  each: require(1124),
  extend: require(1205),
  find: require(1123),
  findKey: require(1207),
  first: require(1116),
  rest: require(1119),
  has: require(1209),
  initial: require(1117),
  isArray: require(1196),
  isFunction: require(1156),
  isNull: require(1199),
  isObject: require(1200),
  isString: require(1201),
  isUndefined: require(1203),
  last: require(1118),
  map: require(1126),
  matches: require(1219),
  noop: require(1220),
  object: require(1121),
  omit: require(1212),
  pick: require(1213),
  toArray: require(1204),
  union: require(1120),
  values: require(1214),
  once: require(1129),
  filter: require(1122),
  invoke: require(1125),
  sortBy: require(1127),
  functions: require(1208),
  difference: require(1113) };

},{"1113":1113,"1116":1116,"1117":1117,"1118":1118,"1119":1119,"1120":1120,"1121":1121,"1122":1122,"1123":1123,"1124":1124,"1125":1125,"1126":1126,"1127":1127,"1129":1129,"1136":1136,"1156":1156,"1167":1167,"1196":1196,"1199":1199,"1200":1200,"1201":1201,"1203":1203,"1204":1204,"1205":1205,"1206":1206,"1207":1207,"1208":1208,"1209":1209,"1212":1212,"1213":1213,"1214":1214,"1219":1219,"1220":1220}],1106:[function(require,module,exports){
'use strict';

module.exports = require(1107);

},{"1107":1107}],1107:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1104);
var uuid = require(1111);
var warnings = require(1112);
var resolve = require(1110);
var Environment = require(1103);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    options = options || {};

    this.__type = 'StateSource';
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"1103":1103,"1104":1104,"1110":1110,"1111":1111,"1112":1112}],1108:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],1109:[function(require,module,exports){
'use strict';

module.exports = require(1105);

},{"1105":1105}],1110:[function(require,module,exports){
'use strict';

var log = require(1104);
var warnings = require(1112);
var getContext = require(1108);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"1104":1104,"1108":1108,"1112":1112}],1111:[function(require,module,exports){
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

},{}],1112:[function(require,module,exports){
'use strict';

var _ = require(1105);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"1105":1105}],1113:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1130":1130,"1143":1143,"1148":1148,"1195":1195,"1196":1196,"19":19}],1114:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1162":1162,"1187":1187,"20":20}],1115:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1162":1162,"1187":1187,"21":21}],1116:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1117:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1115":1115,"23":23}],1118:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1119:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1114":1114,"25":25}],1120:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1130":1130,"1148":1148,"1165":1165,"26":26}],1121:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1196":1196,"27":27}],1122:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1134":1134,"1139":1139,"1145":1145,"1196":1196,"28":28}],1123:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1144":1144,"1176":1176,"29":29}],1124:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1133":1133,"1144":1144,"1178":1178,"30":30}],1125:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1130":1130,"1144":1144,"1188":1188,"31":31}],1126:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1135":1135,"1139":1139,"1158":1158,"1196":1196,"32":32}],1127:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1139":1139,"1144":1144,"1163":1163,"1171":1171,"1187":1187,"1188":1188,"33":33}],1128:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1129:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1128":1128,"35":35}],1130:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1131:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1170":1170,"1198":1198,"37":37}],1132:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1133:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1134:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1135:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1136:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1137:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1138:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1142":1142,"1210":1210,"44":44}],1139:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1159":1159,"1160":1160,"1161":1161,"1167":1167,"1218":1218,"45":45}],1140:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1132":1132,"1133":1133,"1142":1142,"1151":1151,"1183":1183,"1184":1184,"1185":1185,"1196":1196,"1200":1200,"1210":1210,"46":46}],1141:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1142:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1143:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1153":1153,"1169":1169,"1175":1175,"49":49}],1144:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1151":1151,"1173":1173,"50":50}],1145:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1144":1144,"51":51}],1146:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1147:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1148:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1188":1188,"1189":1189,"1195":1195,"1196":1196,"54":54}],1149:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1174":1174,"55":55}],1150:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1149":1149,"1211":1211,"56":56}],1151:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1149":1149,"1210":1210,"57":57}],1152:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1197":1197,"58":58}],1153:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1182":1182,"59":59}],1154:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1155":1155,"60":60}],1155:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1179":1179,"1180":1180,"1181":1181,"1196":1196,"1202":1202,"61":61}],1156:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1157:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1154":1154,"63":63}],1158:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1144":1144,"64":64}],1159:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1157":1157,"1190":1190,"1194":1194,"1210":1210,"1217":1217,"65":65}],1160:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1154":1154,"1190":1190,"1194":1194,"66":66}],1161:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1162:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1163:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1164:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1165:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1153":1153,"1169":1169,"1175":1175,"71":71}],1166:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1167:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1218":1218,"73":73}],1168:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1198":1198,"1217":1217,"74":74}],1169:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1200":1200,"75":75}],1170:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1200":1200,"76":76}],1171:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1141":1141,"77":77}],1172:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1167":1167,"1187":1187,"78":78}],1173:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1188":1188,"1194":1194,"79":79}],1174:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1194":1194,"80":80}],1175:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1131":1131,"1198":1198,"1217":1217,"81":81}],1176:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1139":1139,"1146":1146,"1147":1147,"1196":1196,"82":82}],1177:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1139":1139,"1146":1146,"83":83}],1178:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1167":1167,"1196":1196,"84":84}],1179:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1180:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1181:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1210":1210,"87":87}],1182:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1183:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1184:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1168":1168,"90":90}],1185:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1186:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1187:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1186":1186,"1188":1188,"1200":1200,"93":93}],1188:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1189:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1190:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1200":1200,"96":96}],1191:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1194":1194,"97":97}],1192:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1150":1150,"98":98}],1193:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1186":1186,"1188":1188,"1195":1195,"1196":1196,"1211":1211,"1216":1216,"99":99}],1194:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1200":1200}],1195:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1188":1188,"1189":1189}],1196:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1188":1188,"1189":1189,"1198":1198}],1197:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1156":1156,"1198":1198}],1198:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1189":1189,"1215":1215}],1199:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1200:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1201:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1189":1189}],1202:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1188":1188,"1189":1189}],1203:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1204:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1132":1132,"1188":1188,"1214":1214}],1205:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1138":1138,"1172":1172}],1206:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1130":1130,"1137":1137,"1205":1205}],1207:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1151":1151,"1177":1177}],1208:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1152":1152,"1211":1211}],1209:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1210:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1188":1188,"1193":1193,"1198":1198,"1200":1200}],1211:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1186":1186,"1188":1188,"1195":1195,"1196":1196,"1200":1200,"1216":1216}],1212:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"1130":1130,"1135":1135,"1143":1143,"1148":1148,"1167":1167,"118":118,"1191":1191,"1192":1192,"1211":1211}],1213:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"1130":1130,"1148":1148,"1167":1167,"119":119,"1191":1191,"1192":1192}],1214:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"1166":1166,"120":120,"1210":1210}],1215:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"1164":1164,"121":121}],1216:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1217:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1218:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1219:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"1140":1140,"1159":1159,"125":125}],1220:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1221:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _ = require(1229);
var StateSource = require(1230);
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
      return locationFactory(this.context, location);
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

function defaultLocationFactory(context, location) {
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

},{"1229":1229,"1230":1230}],1222:[function(require,module,exports){
'use strict';

var LocationStateSource = require(1221);

module.exports = function (marty) {
  marty.registerStateSource('LocationStateSource', 'location', LocationStateSource);
};

},{"1221":1221}],1223:[function(require,module,exports){
'use strict';

var _ = require(1229);
var uuid = require(1234);

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var rollbackHandlers = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.rollback = rollback;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addRollbackHandler = addRollbackHandler;
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

  function rollback() {
    var _this = this;

    _.each(rollbackHandlers, function (rollback) {
      return rollback(_this.error);
    });
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

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = ActionPayload;

},{"1229":1229,"1234":1234}],1224:[function(require,module,exports){
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

},{}],1225:[function(require,module,exports){
'use strict';

var _ = require(1229);
var uuid = require(1234);
var Dispatcher = require(1236).Dispatcher;
var ActionPayload = require(1223);
var EventEmitter = require(1347);
var defaultDispatcher = createDefaultDispatcher();

var ACTION_DISPATCHED = 'ACTION_DISPATCHED';

createDispatcher.getDefault = function () {
  return defaultDispatcher;
};

createDispatcher.dispose = function () {
  defaultDispatcher = createDefaultDispatcher();
};

module.exports = createDispatcher;

function createDefaultDispatcher() {
  var defaultDispatcher = createDispatcher();
  defaultDispatcher.isDefault = true;
  return defaultDispatcher;
}

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

},{"1223":1223,"1229":1229,"1234":1234,"1236":1236,"1347":1347}],1226:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],1227:[function(require,module,exports){
'use strict';

var instances = {};
var _ = require(1229);
var Dispatcher = require(1225);

var Instances = {
  get: function get(obj) {
    return instances[this.getId(obj)];
  },
  getId: function getId(obj) {
    var id = obj.__id;

    if (!id) {
      id = obj.id;
    }

    if (!id) {
      throw new Error('Object does not have an Id');
    }

    return id;
  },
  add: function add(obj, instance) {
    instance = instance || {};

    var id = this.getId(obj);

    if (instances[id]) {
      throw new Error('There is already an instance for the ' + instance.__type + ' id');
    }

    _.defaults(instance, {
      dispatcher: Dispatcher.getDefault()
    });

    instances[id] = instance;

    return instance;
  },
  dispose: function dispose(obj) {
    delete instances[this.getId(obj)];
  }
};

module.exports = Instances;

},{"1225":1225,"1229":1229}],1228:[function(require,module,exports){
'use strict';

var _ = require(1229);
var Diagnostics = require(1224);

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

},{"1224":1224,"1229":1229}],1229:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1262),
  bind: require(1293),
  defaults: require(1332),
  each: require(1250),
  extend: require(1331),
  find: require(1249),
  findKey: require(1333),
  first: require(1242),
  rest: require(1245),
  has: require(1335),
  initial: require(1243),
  isArray: require(1322),
  isFunction: require(1282),
  isNull: require(1325),
  isObject: require(1326),
  isString: require(1327),
  isUndefined: require(1329),
  last: require(1244),
  map: require(1252),
  matches: require(1345),
  noop: require(1346),
  object: require(1247),
  omit: require(1338),
  pick: require(1339),
  toArray: require(1330),
  union: require(1246),
  values: require(1340),
  once: require(1255),
  filter: require(1248),
  invoke: require(1251),
  sortBy: require(1253),
  functions: require(1334),
  difference: require(1239) };

},{"1239":1239,"1242":1242,"1243":1243,"1244":1244,"1245":1245,"1246":1246,"1247":1247,"1248":1248,"1249":1249,"1250":1250,"1251":1251,"1252":1252,"1253":1253,"1255":1255,"1262":1262,"1282":1282,"1293":1293,"1322":1322,"1325":1325,"1326":1326,"1327":1327,"1329":1329,"1330":1330,"1331":1331,"1332":1332,"1333":1333,"1334":1334,"1335":1335,"1338":1338,"1339":1339,"1340":1340,"1345":1345,"1346":1346}],1230:[function(require,module,exports){
'use strict';

module.exports = require(1231);

},{"1231":1231}],1231:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1228);
var uuid = require(1234);
var warnings = require(1235);
var Instances = require(1227);
var resolve = require(1233);
var Environment = require(1226);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    this.__type = 'StateSource';
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return Instances.get(this).context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      Instances.dispose(this);
    }
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"1226":1226,"1227":1227,"1228":1228,"1233":1233,"1234":1234,"1235":1235}],1232:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],1233:[function(require,module,exports){
'use strict';

var log = require(1228);
var warnings = require(1235);
var getContext = require(1232);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"1228":1228,"1232":1232,"1235":1235}],1234:[function(require,module,exports){
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

},{}],1235:[function(require,module,exports){
'use strict';

var _ = require(1229);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"1229":1229}],1236:[function(require,module,exports){
arguments[4][620][0].apply(exports,arguments)
},{"1237":1237,"620":620}],1237:[function(require,module,exports){
arguments[4][621][0].apply(exports,arguments)
},{"1238":1238,"621":621}],1238:[function(require,module,exports){
arguments[4][622][0].apply(exports,arguments)
},{"622":622}],1239:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1256":1256,"1269":1269,"1274":1274,"1321":1321,"1322":1322,"19":19}],1240:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1288":1288,"1313":1313,"20":20}],1241:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1288":1288,"1313":1313,"21":21}],1242:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1243:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1241":1241,"23":23}],1244:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1245:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1240":1240,"25":25}],1246:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1256":1256,"1274":1274,"1291":1291,"26":26}],1247:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1322":1322,"27":27}],1248:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1260":1260,"1265":1265,"1271":1271,"1322":1322,"28":28}],1249:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1270":1270,"1302":1302,"29":29}],1250:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1259":1259,"1270":1270,"1304":1304,"30":30}],1251:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1256":1256,"1270":1270,"1314":1314,"31":31}],1252:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1261":1261,"1265":1265,"1284":1284,"1322":1322,"32":32}],1253:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1265":1265,"1270":1270,"1289":1289,"1297":1297,"1313":1313,"1314":1314,"33":33}],1254:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1255:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1254":1254,"35":35}],1256:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1257:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1296":1296,"1324":1324,"37":37}],1258:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1259:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1260:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1261:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1262:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1263:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1264:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1268":1268,"1336":1336,"44":44}],1265:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1285":1285,"1286":1286,"1287":1287,"1293":1293,"1344":1344,"45":45}],1266:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1258":1258,"1259":1259,"1268":1268,"1277":1277,"1309":1309,"1310":1310,"1311":1311,"1322":1322,"1326":1326,"1336":1336,"46":46}],1267:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1268:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1269:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1279":1279,"1295":1295,"1301":1301,"49":49}],1270:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1277":1277,"1299":1299,"50":50}],1271:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1270":1270,"51":51}],1272:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1273:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1274:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1314":1314,"1315":1315,"1321":1321,"1322":1322,"54":54}],1275:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1300":1300,"55":55}],1276:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1275":1275,"1337":1337,"56":56}],1277:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1275":1275,"1336":1336,"57":57}],1278:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1323":1323,"58":58}],1279:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1308":1308,"59":59}],1280:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1281":1281,"60":60}],1281:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1305":1305,"1306":1306,"1307":1307,"1322":1322,"1328":1328,"61":61}],1282:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1283:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1280":1280,"63":63}],1284:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1270":1270,"64":64}],1285:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1283":1283,"1316":1316,"1320":1320,"1336":1336,"1343":1343,"65":65}],1286:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1280":1280,"1316":1316,"1320":1320,"66":66}],1287:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1288:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1289:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1290:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1291:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1279":1279,"1295":1295,"1301":1301,"71":71}],1292:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1293:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1344":1344,"73":73}],1294:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1324":1324,"1343":1343,"74":74}],1295:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1326":1326,"75":75}],1296:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1326":1326,"76":76}],1297:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1267":1267,"77":77}],1298:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1293":1293,"1313":1313,"78":78}],1299:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1314":1314,"1320":1320,"79":79}],1300:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1320":1320,"80":80}],1301:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1257":1257,"1324":1324,"1343":1343,"81":81}],1302:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1265":1265,"1272":1272,"1273":1273,"1322":1322,"82":82}],1303:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1265":1265,"1272":1272,"83":83}],1304:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1293":1293,"1322":1322,"84":84}],1305:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1306:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1307:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1336":1336,"87":87}],1308:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1309:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1310:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1294":1294,"90":90}],1311:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1312:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1313:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1312":1312,"1314":1314,"1326":1326,"93":93}],1314:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1315:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1316:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1326":1326,"96":96}],1317:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1320":1320,"97":97}],1318:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1276":1276,"98":98}],1319:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1312":1312,"1314":1314,"1321":1321,"1322":1322,"1337":1337,"1342":1342,"99":99}],1320:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1326":1326}],1321:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1314":1314,"1315":1315}],1322:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1314":1314,"1315":1315,"1324":1324}],1323:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1282":1282,"1324":1324}],1324:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1315":1315,"1341":1341}],1325:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1326:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1327:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1315":1315}],1328:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1314":1314,"1315":1315}],1329:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1330:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1258":1258,"1314":1314,"1340":1340}],1331:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1264":1264,"1298":1298}],1332:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1256":1256,"1263":1263,"1331":1331}],1333:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1277":1277,"1303":1303}],1334:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1278":1278,"1337":1337}],1335:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1336:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1314":1314,"1319":1319,"1324":1324,"1326":1326}],1337:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1312":1312,"1314":1314,"1321":1321,"1322":1322,"1326":1326,"1342":1342}],1338:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"1256":1256,"1261":1261,"1269":1269,"1274":1274,"1293":1293,"1317":1317,"1318":1318,"1337":1337}],1339:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"1256":1256,"1274":1274,"1293":1293,"1317":1317,"1318":1318}],1340:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"1292":1292,"1336":1336}],1341:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"1290":1290}],1342:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1343:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1344:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1345:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"1266":1266,"1285":1285}],1346:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1347:[function(require,module,exports){
arguments[4][731][0].apply(exports,arguments)
},{"731":731}],1348:[function(require,module,exports){
'use strict';

var Queries = require(1349);
var _ = require(1356);
var createClass = require(1351);

var RESERVED_KEYWORDS = ['dispatch'];

function createQueriesClass(properties) {
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

},{"1349":1349,"1351":1351,"1356":1356}],1349:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var DispatchCoordinator = require(1353);

var Queries = (function (_DispatchCoordinator) {
  function Queries(options) {
    _classCallCheck(this, Queries);

    _get(Object.getPrototypeOf(Queries.prototype), 'constructor', this).call(this, 'Queries', options);
  }

  _inherits(Queries, _DispatchCoordinator);

  return Queries;
})(DispatchCoordinator);

module.exports = Queries;

},{"1353":1353}],1350:[function(require,module,exports){
'use strict';

var Queries = require(1349);
var createQueriesClass = require(1348);

module.exports = function (marty) {
  marty.registerClass('Queries', Queries);
  marty.register('createQueries', createQueries);

  function createQueries(properties) {
    var QueriesClass = createQueriesClass(properties);
    var defaultInstance = this.register(QueriesClass);

    return defaultInstance;
  }
};

},{"1348":1348,"1349":1349}],1351:[function(require,module,exports){
'use strict';

var _ = require(1356);

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
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;

    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
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

},{"1356":1356}],1352:[function(require,module,exports){
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

},{}],1353:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1355);
var uuid = require(1359);
var warnings = require(1360);
var resolve = require(1358);
var Environment = require(1354);

var DispatchCoordinator = (function () {
  function DispatchCoordinator(type, options) {
    _classCallCheck(this, DispatchCoordinator);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into an action creators\' constructor');
    }

    options = options || {};

    this.__type = type;
    this.__context = options.context;
    this.__id = uuid.type(this.__type);
    this.__dispatcher = options.dispatcher;
  }

  _createClass(DispatchCoordinator, [{
    key: 'dispatch',
    value: function dispatch(type) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.__dispatcher.dispatchAction({
        type: type,
        arguments: args
      });
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'context',
    get: function () {
      return this.__context;
    }
  }]);

  return DispatchCoordinator;
})();

module.exports = DispatchCoordinator;

},{"1354":1354,"1355":1355,"1358":1358,"1359":1359,"1360":1360}],1354:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],1355:[function(require,module,exports){
'use strict';

var _ = require(1356);
var Diagnostics = require(1352);

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

},{"1352":1352,"1356":1356}],1356:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1384),
  bind: require(1415),
  defaults: require(1454),
  each: require(1372),
  extend: require(1453),
  find: require(1371),
  findKey: require(1455),
  first: require(1364),
  rest: require(1367),
  has: require(1457),
  initial: require(1365),
  isArray: require(1444),
  isFunction: require(1404),
  isNull: require(1447),
  isObject: require(1448),
  isString: require(1449),
  isUndefined: require(1451),
  last: require(1366),
  map: require(1374),
  matches: require(1467),
  noop: require(1468),
  object: require(1369),
  omit: require(1460),
  pick: require(1461),
  toArray: require(1452),
  union: require(1368),
  values: require(1462),
  once: require(1377),
  filter: require(1370),
  invoke: require(1373),
  sortBy: require(1375),
  functions: require(1456),
  difference: require(1361) };

},{"1361":1361,"1364":1364,"1365":1365,"1366":1366,"1367":1367,"1368":1368,"1369":1369,"1370":1370,"1371":1371,"1372":1372,"1373":1373,"1374":1374,"1375":1375,"1377":1377,"1384":1384,"1404":1404,"1415":1415,"1444":1444,"1447":1447,"1448":1448,"1449":1449,"1451":1451,"1452":1452,"1453":1453,"1454":1454,"1455":1455,"1456":1456,"1457":1457,"1460":1460,"1461":1461,"1462":1462,"1467":1467,"1468":1468}],1357:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],1358:[function(require,module,exports){
'use strict';

var log = require(1355);
var warnings = require(1360);
var getContext = require(1357);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"1355":1355,"1357":1357,"1360":1360}],1359:[function(require,module,exports){
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

},{}],1360:[function(require,module,exports){
'use strict';

var _ = require(1356);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"1356":1356}],1361:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1378":1378,"1391":1391,"1396":1396,"1443":1443,"1444":1444,"19":19}],1362:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1410":1410,"1435":1435,"20":20}],1363:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1410":1410,"1435":1435,"21":21}],1364:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1365:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1363":1363,"23":23}],1366:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1367:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1362":1362,"25":25}],1368:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1378":1378,"1396":1396,"1413":1413,"26":26}],1369:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1444":1444,"27":27}],1370:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1382":1382,"1387":1387,"1393":1393,"1444":1444,"28":28}],1371:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1392":1392,"1424":1424,"29":29}],1372:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1381":1381,"1392":1392,"1426":1426,"30":30}],1373:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1378":1378,"1392":1392,"1436":1436,"31":31}],1374:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1383":1383,"1387":1387,"1406":1406,"1444":1444,"32":32}],1375:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1387":1387,"1392":1392,"1411":1411,"1419":1419,"1435":1435,"1436":1436,"33":33}],1376:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1377:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1376":1376,"35":35}],1378:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1379:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1418":1418,"1446":1446,"37":37}],1380:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1381:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1382:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1383:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1384:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1385:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1386:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1390":1390,"1458":1458,"44":44}],1387:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1407":1407,"1408":1408,"1409":1409,"1415":1415,"1466":1466,"45":45}],1388:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1380":1380,"1381":1381,"1390":1390,"1399":1399,"1431":1431,"1432":1432,"1433":1433,"1444":1444,"1448":1448,"1458":1458,"46":46}],1389:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1390:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1391:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1401":1401,"1417":1417,"1423":1423,"49":49}],1392:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1399":1399,"1421":1421,"50":50}],1393:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1392":1392,"51":51}],1394:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1395:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1396:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1436":1436,"1437":1437,"1443":1443,"1444":1444,"54":54}],1397:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1422":1422,"55":55}],1398:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1397":1397,"1459":1459,"56":56}],1399:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1397":1397,"1458":1458,"57":57}],1400:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1445":1445,"58":58}],1401:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1430":1430,"59":59}],1402:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1403":1403,"60":60}],1403:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1427":1427,"1428":1428,"1429":1429,"1444":1444,"1450":1450,"61":61}],1404:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1405:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1402":1402,"63":63}],1406:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1392":1392,"64":64}],1407:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1405":1405,"1438":1438,"1442":1442,"1458":1458,"1465":1465,"65":65}],1408:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1402":1402,"1438":1438,"1442":1442,"66":66}],1409:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1410:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1411:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1412:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1413:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1401":1401,"1417":1417,"1423":1423,"71":71}],1414:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1415:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1466":1466,"73":73}],1416:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1446":1446,"1465":1465,"74":74}],1417:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1448":1448,"75":75}],1418:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1448":1448,"76":76}],1419:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1389":1389,"77":77}],1420:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1415":1415,"1435":1435,"78":78}],1421:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1436":1436,"1442":1442,"79":79}],1422:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1442":1442,"80":80}],1423:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1379":1379,"1446":1446,"1465":1465,"81":81}],1424:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1387":1387,"1394":1394,"1395":1395,"1444":1444,"82":82}],1425:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1387":1387,"1394":1394,"83":83}],1426:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1415":1415,"1444":1444,"84":84}],1427:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1428:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1429:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1458":1458,"87":87}],1430:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1431:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1432:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1416":1416,"90":90}],1433:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1434:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1435:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1434":1434,"1436":1436,"1448":1448,"93":93}],1436:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1437:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1438:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1448":1448,"96":96}],1439:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1442":1442,"97":97}],1440:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1398":1398,"98":98}],1441:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1434":1434,"1436":1436,"1443":1443,"1444":1444,"1459":1459,"1464":1464,"99":99}],1442:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1448":1448}],1443:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1436":1436,"1437":1437}],1444:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1436":1436,"1437":1437,"1446":1446}],1445:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1404":1404,"1446":1446}],1446:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1437":1437,"1463":1463}],1447:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1448:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1449:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1437":1437}],1450:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1436":1436,"1437":1437}],1451:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1452:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1380":1380,"1436":1436,"1462":1462}],1453:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1386":1386,"1420":1420}],1454:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1378":1378,"1385":1385,"1453":1453}],1455:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1399":1399,"1425":1425}],1456:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1400":1400,"1459":1459}],1457:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1458:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1436":1436,"1441":1441,"1446":1446,"1448":1448}],1459:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1434":1434,"1436":1436,"1443":1443,"1444":1444,"1448":1448,"1464":1464}],1460:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"1378":1378,"1383":1383,"1391":1391,"1396":1396,"1415":1415,"1439":1439,"1440":1440,"1459":1459}],1461:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"1378":1378,"1396":1396,"1415":1415,"1439":1439,"1440":1440}],1462:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"1414":1414,"1458":1458}],1463:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"1412":1412}],1464:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1465:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1466:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1467:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"1388":1388,"1407":1407}],1468:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1469:[function(require,module,exports){
'use strict';

var _ = require(1482);

module.exports = {
  getItem: _.noop,
  setItem: _.noop
};

},{"1482":1482}],1470:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var noopStorage = require(1469);
var StateSource = require(1479);

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
    get: function () {
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

},{"1469":1469,"1479":1479}],1471:[function(require,module,exports){
'use strict';

var SessionStorageStateSource = require(1470);

module.exports = function (marty) {
  marty.registerStateSource('SessionStorageStateSource', 'sessionStorage', SessionStorageStateSource);
};

},{"1470":1470}],1472:[function(require,module,exports){
'use strict';

var _ = require(1478);
var uuid = require(1484);

function ActionPayload(options) {
  options || (options = {});

  var stores = [];
  var components = [];
  var rollbackHandlers = [];
  var actionHandledCallbacks = {};

  _.extend(this, options);

  this.id = options.id || uuid.small();
  this.type = actionType(options.type);
  this.arguments = _.toArray(options.arguments);

  this.toJSON = toJSON;
  this.handled = handled;
  this.toString = toString;
  this.rollback = rollback;
  this.addStoreHandler = addStoreHandler;
  this.onActionHandled = onActionHandled;
  this.addRollbackHandler = addRollbackHandler;
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

  function rollback() {
    var _this = this;

    _.each(rollbackHandlers, function (rollback) {
      return rollback(_this.error);
    });
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

  function addRollbackHandler(rollbackHandler, context) {
    if (_.isFunction(rollbackHandler)) {
      if (context) {
        rollbackHandler = _.bind(rollbackHandler, context);
      }

      rollbackHandlers.push(rollbackHandler);
    }
  }
}

module.exports = ActionPayload;

},{"1478":1478,"1484":1484}],1473:[function(require,module,exports){
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

},{}],1474:[function(require,module,exports){
'use strict';

var _ = require(1478);
var uuid = require(1484);
var Dispatcher = require(1486).Dispatcher;
var ActionPayload = require(1472);
var EventEmitter = require(1597);
var defaultDispatcher = createDefaultDispatcher();

var ACTION_DISPATCHED = 'ACTION_DISPATCHED';

createDispatcher.getDefault = function () {
  return defaultDispatcher;
};

createDispatcher.dispose = function () {
  defaultDispatcher = createDefaultDispatcher();
};

module.exports = createDispatcher;

function createDefaultDispatcher() {
  var defaultDispatcher = createDispatcher();
  defaultDispatcher.isDefault = true;
  return defaultDispatcher;
}

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

},{"1472":1472,"1478":1478,"1484":1484,"1486":1486,"1597":1597}],1475:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],1476:[function(require,module,exports){
'use strict';

var instances = {};
var _ = require(1478);
var Dispatcher = require(1474);

var Instances = {
  get: function get(obj) {
    return instances[this.getId(obj)];
  },
  getId: function getId(obj) {
    var id = obj.__id;

    if (!id) {
      id = obj.id;
    }

    if (!id) {
      throw new Error('Object does not have an Id');
    }

    return id;
  },
  add: function add(obj, instance) {
    instance = instance || {};

    var id = this.getId(obj);

    if (instances[id]) {
      throw new Error('There is already an instance for the ' + instance.__type + ' id');
    }

    _.defaults(instance, {
      dispatcher: Dispatcher.getDefault()
    });

    instances[id] = instance;

    return instance;
  },
  dispose: function dispose(obj) {
    delete instances[this.getId(obj)];
  }
};

module.exports = Instances;

},{"1474":1474,"1478":1478}],1477:[function(require,module,exports){
'use strict';

var _ = require(1478);
var Diagnostics = require(1473);

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

},{"1473":1473,"1478":1478}],1478:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1512),
  bind: require(1543),
  defaults: require(1582),
  each: require(1500),
  extend: require(1581),
  find: require(1499),
  findKey: require(1583),
  first: require(1492),
  rest: require(1495),
  has: require(1585),
  initial: require(1493),
  isArray: require(1572),
  isFunction: require(1532),
  isNull: require(1575),
  isObject: require(1576),
  isString: require(1577),
  isUndefined: require(1579),
  last: require(1494),
  map: require(1502),
  matches: require(1595),
  noop: require(1596),
  object: require(1497),
  omit: require(1588),
  pick: require(1589),
  toArray: require(1580),
  union: require(1496),
  values: require(1590),
  once: require(1505),
  filter: require(1498),
  invoke: require(1501),
  sortBy: require(1503),
  functions: require(1584),
  difference: require(1489) };

},{"1489":1489,"1492":1492,"1493":1493,"1494":1494,"1495":1495,"1496":1496,"1497":1497,"1498":1498,"1499":1499,"1500":1500,"1501":1501,"1502":1502,"1503":1503,"1505":1505,"1512":1512,"1532":1532,"1543":1543,"1572":1572,"1575":1575,"1576":1576,"1577":1577,"1579":1579,"1580":1580,"1581":1581,"1582":1582,"1583":1583,"1584":1584,"1585":1585,"1588":1588,"1589":1589,"1590":1590,"1595":1595,"1596":1596}],1479:[function(require,module,exports){
'use strict';

module.exports = require(1480);

},{"1480":1480}],1480:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1477);
var uuid = require(1484);
var warnings = require(1485);
var Instances = require(1476);
var resolve = require(1483);
var Environment = require(1475);

var StateSource = (function () {
  function StateSource(options) {
    _classCallCheck(this, StateSource);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a state source\'s constructor');
    }

    this.__type = 'StateSource';
    this.__id = uuid.type(this.__type);

    Instances.add(this, options);
  }

  _createClass(StateSource, [{
    key: 'context',
    get: function () {
      return Instances.get(this).context;
    }
  }, {
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      Instances.dispose(this);
    }
  }]);

  return StateSource;
})();

module.exports = StateSource;

},{"1475":1475,"1476":1476,"1477":1477,"1483":1483,"1484":1484,"1485":1485}],1481:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],1482:[function(require,module,exports){
'use strict';

module.exports = require(1478);

},{"1478":1478}],1483:[function(require,module,exports){
'use strict';

var log = require(1477);
var warnings = require(1485);
var getContext = require(1481);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"1477":1477,"1481":1481,"1485":1485}],1484:[function(require,module,exports){
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

},{}],1485:[function(require,module,exports){
'use strict';

var _ = require(1478);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"1478":1478}],1486:[function(require,module,exports){
arguments[4][620][0].apply(exports,arguments)
},{"1487":1487,"620":620}],1487:[function(require,module,exports){
arguments[4][621][0].apply(exports,arguments)
},{"1488":1488,"621":621}],1488:[function(require,module,exports){
arguments[4][622][0].apply(exports,arguments)
},{"622":622}],1489:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1506":1506,"1519":1519,"1524":1524,"1571":1571,"1572":1572,"19":19}],1490:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1538":1538,"1563":1563,"20":20}],1491:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1538":1538,"1563":1563,"21":21}],1492:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1493:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1491":1491,"23":23}],1494:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1495:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1490":1490,"25":25}],1496:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1506":1506,"1524":1524,"1541":1541,"26":26}],1497:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1572":1572,"27":27}],1498:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1510":1510,"1515":1515,"1521":1521,"1572":1572,"28":28}],1499:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1520":1520,"1552":1552,"29":29}],1500:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1509":1509,"1520":1520,"1554":1554,"30":30}],1501:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1506":1506,"1520":1520,"1564":1564,"31":31}],1502:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1511":1511,"1515":1515,"1534":1534,"1572":1572,"32":32}],1503:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1515":1515,"1520":1520,"1539":1539,"1547":1547,"1563":1563,"1564":1564,"33":33}],1504:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1505:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1504":1504,"35":35}],1506:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1507:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1546":1546,"1574":1574,"37":37}],1508:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1509:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1510:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1511:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1512:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1513:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1514:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1518":1518,"1586":1586,"44":44}],1515:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1535":1535,"1536":1536,"1537":1537,"1543":1543,"1594":1594,"45":45}],1516:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1508":1508,"1509":1509,"1518":1518,"1527":1527,"1559":1559,"1560":1560,"1561":1561,"1572":1572,"1576":1576,"1586":1586,"46":46}],1517:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1518:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1519:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1529":1529,"1545":1545,"1551":1551,"49":49}],1520:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1527":1527,"1549":1549,"50":50}],1521:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1520":1520,"51":51}],1522:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1523:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1524:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1564":1564,"1565":1565,"1571":1571,"1572":1572,"54":54}],1525:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1550":1550,"55":55}],1526:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1525":1525,"1587":1587,"56":56}],1527:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1525":1525,"1586":1586,"57":57}],1528:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1573":1573,"58":58}],1529:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1558":1558,"59":59}],1530:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1531":1531,"60":60}],1531:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1555":1555,"1556":1556,"1557":1557,"1572":1572,"1578":1578,"61":61}],1532:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1533:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1530":1530,"63":63}],1534:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1520":1520,"64":64}],1535:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1533":1533,"1566":1566,"1570":1570,"1586":1586,"1593":1593,"65":65}],1536:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1530":1530,"1566":1566,"1570":1570,"66":66}],1537:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1538:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1539:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1540:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1541:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1529":1529,"1545":1545,"1551":1551,"71":71}],1542:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1543:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1594":1594,"73":73}],1544:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1574":1574,"1593":1593,"74":74}],1545:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1576":1576,"75":75}],1546:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1576":1576,"76":76}],1547:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1517":1517,"77":77}],1548:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1543":1543,"1563":1563,"78":78}],1549:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1564":1564,"1570":1570,"79":79}],1550:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1570":1570,"80":80}],1551:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1507":1507,"1574":1574,"1593":1593,"81":81}],1552:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1515":1515,"1522":1522,"1523":1523,"1572":1572,"82":82}],1553:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1515":1515,"1522":1522,"83":83}],1554:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1543":1543,"1572":1572,"84":84}],1555:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1556:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1557:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1586":1586,"87":87}],1558:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1559:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1560:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1544":1544,"90":90}],1561:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1562:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1563:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1562":1562,"1564":1564,"1576":1576,"93":93}],1564:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1565:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1566:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1576":1576,"96":96}],1567:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1570":1570,"97":97}],1568:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1526":1526,"98":98}],1569:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1562":1562,"1564":1564,"1571":1571,"1572":1572,"1587":1587,"1592":1592,"99":99}],1570:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1576":1576}],1571:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1564":1564,"1565":1565}],1572:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1564":1564,"1565":1565,"1574":1574}],1573:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1532":1532,"1574":1574}],1574:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1565":1565,"1591":1591}],1575:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1576:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1577:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1565":1565}],1578:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1564":1564,"1565":1565}],1579:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1580:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1508":1508,"1564":1564,"1590":1590}],1581:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1514":1514,"1548":1548}],1582:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1506":1506,"1513":1513,"1581":1581}],1583:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1527":1527,"1553":1553}],1584:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1528":1528,"1587":1587}],1585:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1586:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1564":1564,"1569":1569,"1574":1574,"1576":1576}],1587:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1562":1562,"1564":1564,"1571":1571,"1572":1572,"1576":1576,"1592":1592}],1588:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"1506":1506,"1511":1511,"1519":1519,"1524":1524,"1543":1543,"1567":1567,"1568":1568,"1587":1587}],1589:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"1506":1506,"1524":1524,"1543":1543,"1567":1567,"1568":1568}],1590:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"1542":1542,"1586":1586}],1591:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"1540":1540}],1592:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1593:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1594:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1595:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"1516":1516,"1535":1535}],1596:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1597:[function(require,module,exports){
arguments[4][731][0].apply(exports,arguments)
},{"731":731}],1598:[function(require,module,exports){
'use strict';

var _ = require(1604);
var uuid = require(1605);
var StoreObserver = require(1603);
var reservedKeys = ['listenTo', 'getState', 'getInitialState'];

function StateMixin(options) {
  var config, instanceMethods;

  if (!options) {
    throw new Error('The state mixin is expecting some options');
  }

  var React = options.React;

  if (isStore(options)) {
    config = storeMixinConfig(options);
  } else {
    config = simpleMixinConfig(options);
    instanceMethods = _.omit(options, reservedKeys);
  }

  var mixin = _.extend({
    contextTypes: {
      marty: React.PropTypes.object
    },
    componentDidMount: function componentDidMount() {
      var component = {
        id: this.__id,
        displayName: this.displayName || this.constructor.displayName };

      this.__observer = new StoreObserver({
        component: component,
        stores: config.stores,
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
      return config.getState(this);
    },
    getInitialState: function getInitialState() {
      var el = this._currentElement;

      if (!this.displayName && el && el.type) {
        this.displayName = el.type.displayName;
      }

      this.state = {};
      this.__id = uuid.type('Component');

      if (options.getInitialState) {
        this.state = options.getInitialState();
      }

      this.state = _.extend(this.state, this.getState());

      return this.state;
    }
  }, instanceMethods);

  return mixin;

  function storeMixinConfig(store) {
    return {
      stores: [store],
      getState: function getState() {
        return store.getState();
      }
    };
  }

  function simpleMixinConfig(options) {
    var stores = options.listenTo || [];
    var storesToGetStateFrom = findStoresToGetStateFrom(options);

    if (!_.isArray(stores)) {
      stores = [stores];
    }

    if (!areStores(stores)) {
      throw new Error('Can only listen to stores');
    }

    stores = stores.concat(_.values(storesToGetStateFrom));

    return {
      stores: stores,
      getState: getState
    };

    function getState(view) {
      var state = _.object(_.map(storesToGetStateFrom, getStateFromStore));

      if (options.getState) {
        state = _.extend(state, options.getState.call(view));
      }

      return state;

      function getStateFromStore(store, name) {
        return [name, store.getState()];
      }
    }

    function findStoresToGetStateFrom(options) {
      var storesToGetStateFrom = {};
      _.each(options, function (value, key) {
        if (reservedKeys.indexOf(key) === -1 && isStore(value)) {
          storesToGetStateFrom[key] = value;
        }
      });

      return storesToGetStateFrom;
    }
  }

  function areStores(stores) {
    for (var i = stores.length - 1; i >= 0; i--) {
      if (!isStore(stores[i])) {
        return false;
      }
    }
    return true;
  }

  function isStore(store) {
    return store.getState && store.addChangeListener;
  }
}

module.exports = StateMixin;

},{"1603":1603,"1604":1604,"1605":1605}],1599:[function(require,module,exports){
'use strict';

var _ = require(1602);
var StateMixin = require(1598);

module.exports = function (marty, React) {
  marty.register('createStateMixin', createStateMixin);

  function createStateMixin(options) {
    return new StateMixin(_.defaults(options, {
      React: React
    }));
  }
};

},{"1598":1598,"1602":1602}],1600:[function(require,module,exports){
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

},{}],1601:[function(require,module,exports){
'use strict';

var _ = require(1602);
var Diagnostics = require(1600);

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

},{"1600":1600,"1602":1602}],1602:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1629),
  bind: require(1660),
  defaults: require(1699),
  each: require(1617),
  extend: require(1698),
  find: require(1616),
  findKey: require(1700),
  first: require(1609),
  rest: require(1612),
  has: require(1702),
  initial: require(1610),
  isArray: require(1689),
  isFunction: require(1649),
  isNull: require(1692),
  isObject: require(1693),
  isString: require(1694),
  isUndefined: require(1696),
  last: require(1611),
  map: require(1619),
  matches: require(1712),
  noop: require(1713),
  object: require(1614),
  omit: require(1705),
  pick: require(1706),
  toArray: require(1697),
  union: require(1613),
  values: require(1707),
  once: require(1622),
  filter: require(1615),
  invoke: require(1618),
  sortBy: require(1620),
  functions: require(1701),
  difference: require(1606) };

},{"1606":1606,"1609":1609,"1610":1610,"1611":1611,"1612":1612,"1613":1613,"1614":1614,"1615":1615,"1616":1616,"1617":1617,"1618":1618,"1619":1619,"1620":1620,"1622":1622,"1629":1629,"1649":1649,"1660":1660,"1689":1689,"1692":1692,"1693":1693,"1694":1694,"1696":1696,"1697":1697,"1698":1698,"1699":1699,"1700":1700,"1701":1701,"1702":1702,"1705":1705,"1706":1706,"1707":1707,"1712":1712,"1713":1713}],1603:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1601);
var _ = require(1602);

var StoreObserver = (function () {
  function StoreObserver(options) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    options = options || {};

    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    this.listeners = _.map(options.stores, function (store) {
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

      return store['for'](component).addChangeListener(function (state, store) {
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

module.exports = StoreObserver;

},{"1601":1601,"1602":1602}],1604:[function(require,module,exports){
'use strict';

module.exports = require(1602);

},{"1602":1602}],1605:[function(require,module,exports){
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

},{}],1606:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1623":1623,"1636":1636,"1641":1641,"1688":1688,"1689":1689,"19":19}],1607:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1655":1655,"1680":1680,"20":20}],1608:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1655":1655,"1680":1680,"21":21}],1609:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1610:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1608":1608,"23":23}],1611:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1612:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1607":1607,"25":25}],1613:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1623":1623,"1641":1641,"1658":1658,"26":26}],1614:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1689":1689,"27":27}],1615:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1627":1627,"1632":1632,"1638":1638,"1689":1689,"28":28}],1616:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1637":1637,"1669":1669,"29":29}],1617:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1626":1626,"1637":1637,"1671":1671,"30":30}],1618:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1623":1623,"1637":1637,"1681":1681,"31":31}],1619:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1628":1628,"1632":1632,"1651":1651,"1689":1689,"32":32}],1620:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1632":1632,"1637":1637,"1656":1656,"1664":1664,"1680":1680,"1681":1681,"33":33}],1621:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1622:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1621":1621,"35":35}],1623:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1624:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1663":1663,"1691":1691,"37":37}],1625:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1626:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1627:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1628:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1629:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1630:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1631:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1635":1635,"1703":1703,"44":44}],1632:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1652":1652,"1653":1653,"1654":1654,"1660":1660,"1711":1711,"45":45}],1633:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1625":1625,"1626":1626,"1635":1635,"1644":1644,"1676":1676,"1677":1677,"1678":1678,"1689":1689,"1693":1693,"1703":1703,"46":46}],1634:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1635:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1636:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1646":1646,"1662":1662,"1668":1668,"49":49}],1637:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1644":1644,"1666":1666,"50":50}],1638:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1637":1637,"51":51}],1639:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1640:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1641:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1681":1681,"1682":1682,"1688":1688,"1689":1689,"54":54}],1642:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1667":1667,"55":55}],1643:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1642":1642,"1704":1704,"56":56}],1644:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1642":1642,"1703":1703,"57":57}],1645:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1690":1690,"58":58}],1646:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1675":1675,"59":59}],1647:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1648":1648,"60":60}],1648:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1672":1672,"1673":1673,"1674":1674,"1689":1689,"1695":1695,"61":61}],1649:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1650:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1647":1647,"63":63}],1651:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1637":1637,"64":64}],1652:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1650":1650,"1683":1683,"1687":1687,"1703":1703,"1710":1710,"65":65}],1653:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1647":1647,"1683":1683,"1687":1687,"66":66}],1654:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1655:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1656:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1657:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1658:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1646":1646,"1662":1662,"1668":1668,"71":71}],1659:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1660:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1711":1711,"73":73}],1661:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1691":1691,"1710":1710,"74":74}],1662:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1693":1693,"75":75}],1663:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1693":1693,"76":76}],1664:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1634":1634,"77":77}],1665:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1660":1660,"1680":1680,"78":78}],1666:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1681":1681,"1687":1687,"79":79}],1667:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1687":1687,"80":80}],1668:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1624":1624,"1691":1691,"1710":1710,"81":81}],1669:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1632":1632,"1639":1639,"1640":1640,"1689":1689,"82":82}],1670:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1632":1632,"1639":1639,"83":83}],1671:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1660":1660,"1689":1689,"84":84}],1672:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1673:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1674:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1703":1703,"87":87}],1675:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1676:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1677:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1661":1661,"90":90}],1678:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1679:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1680:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1679":1679,"1681":1681,"1693":1693,"93":93}],1681:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1682:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1683:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1693":1693,"96":96}],1684:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1687":1687,"97":97}],1685:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1643":1643,"98":98}],1686:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1679":1679,"1681":1681,"1688":1688,"1689":1689,"1704":1704,"1709":1709,"99":99}],1687:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1693":1693}],1688:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1681":1681,"1682":1682}],1689:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1681":1681,"1682":1682,"1691":1691}],1690:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1649":1649,"1691":1691}],1691:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1682":1682,"1708":1708}],1692:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1693:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1694:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1682":1682}],1695:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1681":1681,"1682":1682}],1696:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1697:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1625":1625,"1681":1681,"1707":1707}],1698:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1631":1631,"1665":1665}],1699:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1623":1623,"1630":1630,"1698":1698}],1700:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1644":1644,"1670":1670}],1701:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1645":1645,"1704":1704}],1702:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1703:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1681":1681,"1686":1686,"1691":1691,"1693":1693}],1704:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1679":1679,"1681":1681,"1688":1688,"1689":1689,"1693":1693,"1709":1709}],1705:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"1623":1623,"1628":1628,"1636":1636,"1641":1641,"1660":1660,"1684":1684,"1685":1685,"1704":1704}],1706:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"1623":1623,"1641":1641,"1660":1660,"1684":1684,"1685":1685}],1707:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"1659":1659,"1703":1703}],1708:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"1657":1657}],1709:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1710:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1711:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1712:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"1633":1633,"1652":1652}],1713:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1714:[function(require,module,exports){
'use strict';

var log = require(1734);
var Store = require(1719);
var _ = require(1737);
var warnings = require(1740);
var createClass = require(1726);

var RESERVED_FUNCTIONS = ['getState'];
var VIRTUAL_FUNCTIONS = ['clear', 'dispose'];

function createStoreClass(properties) {
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

},{"1719":1719,"1726":1726,"1734":1734,"1737":1737,"1740":1740}],1715:[function(require,module,exports){
'use strict';

var when = require(1723);
var NotFoundError = require(1732);

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
      var listener;

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

},{"1723":1723,"1732":1732}],1716:[function(require,module,exports){
'use strict';

var constants = require(1725);

module.exports = constants(['PENDING', 'FAILED', 'DONE', 'FETCH_FAILED']);

},{"1725":1725}],1717:[function(require,module,exports){
'use strict';

var _ = require(1737);

function handleAction(action) {
  this.__validateHandlers();

  var store = this;
  var handlers = _.object(_.map(store.handlers, getHandlerWithPredicates));

  _.each(handlers, function (predicates, handlerName) {
    _.each(predicates, function (predicate) {
      if (predicate(action)) {
        var rollbackHandler;

        try {
          store.action = action;
          action.addStoreHandler(store, handlerName, predicate.toJSON());
          rollbackHandler = store[handlerName].apply(store, action.arguments);
        } finally {
          action.addRollbackHandler(rollbackHandler, store);
        }
      }
    });
  });
}

function getHandlerWithPredicates(actionPredicates, handler) {
  _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

  var predicates = _.map(actionPredicates, toFunc);

  return [handler, predicates];

  function toFunc(actionPredicate) {
    if (actionPredicate.isActionCreator) {
      actionPredicate = {
        type: actionPredicate.toString()
      };
    } else if (_.isString(actionPredicate)) {
      actionPredicate = {
        type: actionPredicate
      };
    }

    var func = _.matches(actionPredicate);

    func.toJSON = function () {
      return actionPredicate;
    };

    return func;
  }
}

module.exports = handleAction;

},{"1737":1737}],1718:[function(require,module,exports){
'use strict';

var log = require(1734);
var _ = require(1735);
var UnknownStoreError = require(1733);

var SERIALIZED_WINDOW_OBJECT = '__marty';

module.exports = {
  rehydrate: rehydrate,
  dehydrate: dehydrate,
  clearState: clearState,
  replaceState: replaceState
};

function getDefaultStores(context) {
  return context.registry.getAllDefaultStores();
}

function clearState() {
  _.each(getDefaultStores(this), function (store) {
    store.clear();
  });
}

function replaceState(states) {
  _.each(getDefaultStores(this), function (store) {
    var id = storeId(store);

    if (states[id]) {
      store.replaceState(states[id]);
    }
  });
}

function rehydrate(storeStates) {
  var stores = indexById(getDefaultStores(this));
  storeStates = storeStates || getStoreStatesFromWindow();

  _.each(storeStates, function (dehydratedStore, storeName) {
    var store = stores[storeName];
    var state = dehydratedStore.state;

    if (!store) {
      throw new UnknownStoreError(storeName);
    }

    store.__fetchHistory = dehydratedStore.fetchHistory;

    if (_.isFunction(store.rehydrate)) {
      store.rehydrate(state);
    } else {
      try {
        store.replaceState(state);
      } catch (e) {
        log.error('Failed to rehydrate the state of ' + storeName + '. You might be able ' + 'to solve this problem by implementing Store#rehydrate()');

        throw e;
      }
    }
  });

  function indexById(stores) {
    return _.object(_.map(stores, function (store) {
      return storeId(store);
    }), stores);
  }

  function getStoreStatesFromWindow() {
    if (!window || !window[SERIALIZED_WINDOW_OBJECT]) {
      return;
    }

    return window[SERIALIZED_WINDOW_OBJECT].stores;
  }
}

function dehydrate(context) {
  var dehydratedStores = {};
  var stores = context ? context.getAllStores() : getDefaultStores(this);

  _.each(stores, function (store) {
    var id = storeId(store);

    if (id) {
      dehydratedStores[id] = {
        fetchHistory: store.__fetchHistory,
        state: (store.dehydrate || store.getState).call(store)
      };
    }
  });

  dehydratedStores.toString = function () {
    return '(window.__marty||(window.__marty={})).stores=' + JSON.stringify(dehydratedStores);
  };

  dehydratedStores.toJSON = function () {
    return _.omit(dehydratedStores, 'toString', 'toJSON');
  };

  return dehydratedStores;
}

function storeId(store) {
  return store.constructor.id;
}

},{"1733":1733,"1734":1734,"1735":1735}],1719:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var log = require(1734);
var fetch = require(1721);
var _ = require(1737);
var uuid = require(1739);
var warnings = require(1740);
var resolve = require(1738);
var StoreEvents = require(1720);
var Environment = require(1728);
var handleAction = require(1717);
var EventEmitter = require(1849);
var validateHandlers = require(1722);

var Store = (function () {
  function Store(options) {
    var _this = this;

    _classCallCheck(this, Store);

    if (!options && warnings.superNotCalledWithOptions && Environment.isServer) {
      log.warn('Warning: Options were not passed into a store\'s constructor');
    }

    options = options || {};

    this.__type = 'Store';
    this.__id = uuid.type(this.__type);
    this.__state = {};
    this.__fetchHistory = {};
    this.__failedFetches = {};
    this.__fetchInProgress = {};
    this.__context = options.context;
    this.__emitter = new EventEmitter();
    this.__dispatcher = options.dispatcher;
    this.__validateHandlers = _.once(function () {
      return validateHandlers(_this);
    });

    var initialState = this.getInitialState();

    if (_.isUndefined(initialState)) {
      initialState = {};
    }

    this.replaceState(initialState);

    this.dispatchToken = this.__dispatcher.register(_.bind(this.handleAction, this));
  }

  _createClass(Store, [{
    key: 'for',
    value: function _for(obj) {
      return resolve(this, obj);
    }
  }, {
    key: 'context',
    get: function () {
      return this.__context;
    }
  }, {
    key: 'state',
    get: function () {
      return this.getState();
    },
    set: function (newState) {
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
        this.__dispatcher.unregister(dispatchToken);
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
      var dispatcher = this.__dispatcher;

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

},{"1717":1717,"1720":1720,"1721":1721,"1722":1722,"1728":1728,"1734":1734,"1737":1737,"1738":1738,"1739":1739,"1740":1740,"1849":1849}],1720:[function(require,module,exports){
'use strict';

module.exports = {
  CHANGE_EVENT: 'changed',
  FETCH_CHANGE_EVENT: 'fetch-changed'
};

},{}],1721:[function(require,module,exports){
'use strict';

var log = require(1734);
var _ = require(1737);
var warnings = require(1740);
var fetchResult = require(1715);
var StoreEvents = require(1720);
var CompoundError = require(1731);
var NotFoundError = require(1732);
var FetchConstants = require(1716);

function fetch(id, local, remote) {
  var store = this;
  var options,
      result,
      error,
      cacheError,
      context = this.context;

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

  if (context) {
    context.fetchStarted(store.id, options.id);
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

    return fetchDone(result);
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
            fetchDone();
            store.hasChanged();
          } else {
            fetchNotFound();
            store.hasChanged();
          }
        })['catch'](function (error) {
          fetchFailed(error);
          store.hasChanged();

          store.__dispatcher.dispatchAction({
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

  function fetchDone(result) {
    finished();

    if (context && result) {
      context.fetchDone(store.id, options.id, 'DONE', {
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

    if (context) {
      context.fetchDone(store.id, options.id, 'FAILED', {
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

},{"1715":1715,"1716":1716,"1720":1720,"1731":1731,"1732":1732,"1734":1734,"1737":1737,"1740":1740}],1722:[function(require,module,exports){
'use strict';

var _ = require(1737);
var ActionHandlerNotFoundError = require(1729);
var ActionPredicateUndefinedError = require(1730);

function validateHandlers(store) {
  _.each(store.handlers, function (actionPredicate, handlerName) {
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

},{"1729":1729,"1730":1730,"1737":1737}],1723:[function(require,module,exports){
'use strict';

var log = require(1734);
var _ = require(1737);
var StatusConstants = require(1716);

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

  try {
    switch (this.status) {
      case StatusConstants.PENDING.toString():
        return handler.call(new WhenContext());
      case StatusConstants.FAILED.toString():
        return handler.call(new WhenContext(), this.error);
      case StatusConstants.DONE.toString():
        return handler.call(new WhenContext(), this.result);
      default:
        throw new Error('Unknown fetch result status');
    }
  } catch (e) {
    var errorMessage = 'An error occured when handling the DONE state of ';

    if (this.id) {
      errorMessage += 'the fetch \'' + this.id + '\'';
    } else {
      errorMessage += 'a fetch';
    }

    if (this.store) {
      errorMessage += ' from the store ' + this.store;
    }

    log.error(errorMessage, e);

    throw e;
  }

  function WhenContext() {
    _.extend(this, handlers);
  }
}

function join() {
  var parentContext;
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
    status: StatusConstants.FAILED.toString()
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
    var status = fetchResults[i].status;

    if (status === StatusConstants.FAILED.toString() || status === StatusConstants.PENDING.toString()) {
      return status;
    }
  }

  return StatusConstants.DONE.toString();
}

module.exports = when;
/* fetchResults, handlers */

},{"1716":1716,"1734":1734,"1737":1737}],1724:[function(require,module,exports){
'use strict';

var Store = require(1719);
var state = require(1718);
var _ = require(1735);
var createStoreClass = require(1714);

module.exports = function (marty) {
  marty.registerClass('Store', Store);
  marty.register('createStore', createStore);

  _.each(state, function (value, key) {
    marty.register(key, value);
  });

  function createStore(properties) {
    var StoreClass = createStoreClass(properties);
    var defaultInstance = this.register(StoreClass);

    return defaultInstance;
  }
};

},{"1714":1714,"1718":1718,"1719":1719,"1735":1735}],1725:[function(require,module,exports){
'use strict';

var log = require(1734);
var _ = require(1737);
var warnings = require(1740);

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
        constants[type] = createActionCreator(type);
      });
    });

    return constants;
  }

  function createActionCreator(actionType) {
    var constantActionCreator = function constantActionCreator(actionCreator) {
      if (warnings.invokeConstant) {
        log.warn('Warning: Invoking constants has been depreciated. ' + 'Please migrate to new style of creating action creators ' + 'http://martyjs.org/guides/action-creators/migrating-from-v8.html');
      }

      if (!_.isFunction(actionCreator)) {
        actionCreator = autoDispatch;
      }

      return function () {
        var context = actionContext(this);

        actionCreator.apply(context, arguments);

        function actionContext(creators) {
          return _.extend({}, creators, {
            dispatch: function dispatch() {
              var args = _.toArray(arguments);

              args.unshift(actionType);

              creators.dispatch.apply(creators, args);
            }
          });
        }
      };

      function autoDispatch() {
        this.dispatch.apply(this, arguments);
      }
    };

    constantActionCreator.type = actionType;
    constantActionCreator.isActionCreator = true;
    constantActionCreator.toString = function () {
      return actionType;
    };

    return constantActionCreator;
  }
}

module.exports = constants;

},{"1734":1734,"1737":1737,"1740":1740}],1726:[function(require,module,exports){
'use strict';

var _ = require(1735);

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
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;

    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
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

},{"1735":1735}],1727:[function(require,module,exports){
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

},{}],1728:[function(require,module,exports){
'use strict';

var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};

},{}],1729:[function(require,module,exports){
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

},{}],1730:[function(require,module,exports){
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

},{}],1731:[function(require,module,exports){
'use strict';

function CompoundError(errors) {
  this.errors = errors;
  this.name = 'Compound error';
}

CompoundError.prototype = Error.prototype;

module.exports = CompoundError;

},{}],1732:[function(require,module,exports){
'use strict';

function NotFoundError(message) {
  this.name = 'Not found';
  this.message = message || 'Not found';
  this.status = 404;
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;

},{}],1733:[function(require,module,exports){
'use strict';

function UnkownStoreError(store) {
  this.name = 'Unknown store';
  this.message = 'Unknown store ' + store;
}

UnkownStoreError.prototype = Error.prototype;

module.exports = UnkownStoreError;

},{}],1734:[function(require,module,exports){
'use strict';

var _ = require(1735);
var Diagnostics = require(1727);

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

},{"1727":1727,"1735":1735}],1735:[function(require,module,exports){
'use strict';

module.exports = {
  any: require(1764),
  bind: require(1795),
  defaults: require(1834),
  each: require(1752),
  extend: require(1833),
  find: require(1751),
  findKey: require(1835),
  first: require(1744),
  rest: require(1747),
  has: require(1837),
  initial: require(1745),
  isArray: require(1824),
  isFunction: require(1784),
  isNull: require(1827),
  isObject: require(1828),
  isString: require(1829),
  isUndefined: require(1831),
  last: require(1746),
  map: require(1754),
  matches: require(1847),
  noop: require(1848),
  object: require(1749),
  omit: require(1840),
  pick: require(1841),
  toArray: require(1832),
  union: require(1748),
  values: require(1842),
  once: require(1757),
  filter: require(1750),
  invoke: require(1753),
  sortBy: require(1755),
  functions: require(1836),
  difference: require(1741) };

},{"1741":1741,"1744":1744,"1745":1745,"1746":1746,"1747":1747,"1748":1748,"1749":1749,"1750":1750,"1751":1751,"1752":1752,"1753":1753,"1754":1754,"1755":1755,"1757":1757,"1764":1764,"1784":1784,"1795":1795,"1824":1824,"1827":1827,"1828":1828,"1829":1829,"1831":1831,"1832":1832,"1833":1833,"1834":1834,"1835":1835,"1836":1836,"1837":1837,"1840":1840,"1841":1841,"1842":1842,"1847":1847,"1848":1848}],1736:[function(require,module,exports){
"use strict";

function getContext(obj) {
  if (!obj) {
    return;
  }

  if (isContext(obj)) {
    return obj;
  }

  if (isContext(obj.context)) {
    return obj.context;
  }

  if (obj.context && isContext(obj.context.marty)) {
    return obj.context.marty;
  }

  function isContext(obj) {
    return obj && obj.__isContext;
  }
}

module.exports = getContext;

},{}],1737:[function(require,module,exports){
'use strict';

module.exports = require(1735);

},{"1735":1735}],1738:[function(require,module,exports){
'use strict';

var log = require(1734);
var warnings = require(1740);
var getContext = require(1736);

function resolve(obj, subject) {
  var context = getContext(subject);

  if (context) {
    return context.resolve(obj);
  }

  if (!obj.__isDefaultInstance && warnings.cannotFindContext) {
    log.warn('Warning: Could not find context in object', obj);
  }

  return obj;
}

module.exports = resolve;

},{"1734":1734,"1736":1736,"1740":1740}],1739:[function(require,module,exports){
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

},{}],1740:[function(require,module,exports){
'use strict';

var _ = require(1735);

var warnings = {
  without: without,
  invokeConstant: true,
  reservedFunction: true,
  cannotFindContext: true,
  classDoesNotHaveAnId: true,
  stateIsNullOrUndefined: true,
  callingResolverOnServer: true,
  stateSourceAlreadyExists: true,
  superNotCalledWithOptions: true,
  promiseNotReturnedFromRemotely: true,
  contextNotPassedInToConstructor: true
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

},{"1735":1735}],1741:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"1758":1758,"1771":1771,"1776":1776,"1823":1823,"1824":1824,"19":19}],1742:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"1790":1790,"1815":1815,"20":20}],1743:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"1790":1790,"1815":1815,"21":21}],1744:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"22":22}],1745:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"1743":1743,"23":23}],1746:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"24":24}],1747:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"1742":1742,"25":25}],1748:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"1758":1758,"1776":1776,"1793":1793,"26":26}],1749:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"1824":1824,"27":27}],1750:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"1762":1762,"1767":1767,"1773":1773,"1824":1824,"28":28}],1751:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"1772":1772,"1804":1804,"29":29}],1752:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"1761":1761,"1772":1772,"1806":1806,"30":30}],1753:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"1758":1758,"1772":1772,"1816":1816,"31":31}],1754:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"1763":1763,"1767":1767,"1786":1786,"1824":1824,"32":32}],1755:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"1767":1767,"1772":1772,"1791":1791,"1799":1799,"1815":1815,"1816":1816,"33":33}],1756:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"34":34}],1757:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"1756":1756,"35":35}],1758:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"36":36}],1759:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"1798":1798,"1826":1826,"37":37}],1760:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"38":38}],1761:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"39":39}],1762:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"40":40}],1763:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"41":41}],1764:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"42":42}],1765:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"43":43}],1766:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"1770":1770,"1838":1838,"44":44}],1767:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"1787":1787,"1788":1788,"1789":1789,"1795":1795,"1846":1846,"45":45}],1768:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"1760":1760,"1761":1761,"1770":1770,"1779":1779,"1811":1811,"1812":1812,"1813":1813,"1824":1824,"1828":1828,"1838":1838,"46":46}],1769:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"47":47}],1770:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"48":48}],1771:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"1781":1781,"1797":1797,"1803":1803,"49":49}],1772:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"1779":1779,"1801":1801,"50":50}],1773:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"1772":1772,"51":51}],1774:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"52":52}],1775:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"53":53}],1776:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"1816":1816,"1817":1817,"1823":1823,"1824":1824,"54":54}],1777:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"1802":1802,"55":55}],1778:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"1777":1777,"1839":1839,"56":56}],1779:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"1777":1777,"1838":1838,"57":57}],1780:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"1825":1825,"58":58}],1781:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"1810":1810,"59":59}],1782:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"1783":1783,"60":60}],1783:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"1807":1807,"1808":1808,"1809":1809,"1824":1824,"1830":1830,"61":61}],1784:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"62":62}],1785:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"1782":1782,"63":63}],1786:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"1772":1772,"64":64}],1787:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"1785":1785,"1818":1818,"1822":1822,"1838":1838,"1845":1845,"65":65}],1788:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"1782":1782,"1818":1818,"1822":1822,"66":66}],1789:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"67":67}],1790:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"68":68}],1791:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"69":69}],1792:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"70":70}],1793:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"1781":1781,"1797":1797,"1803":1803,"71":71}],1794:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"72":72}],1795:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"1846":1846,"73":73}],1796:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"1826":1826,"1845":1845,"74":74}],1797:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"1828":1828,"75":75}],1798:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"1828":1828,"76":76}],1799:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"1769":1769,"77":77}],1800:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"1795":1795,"1815":1815,"78":78}],1801:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"1816":1816,"1822":1822,"79":79}],1802:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"1822":1822,"80":80}],1803:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"1759":1759,"1826":1826,"1845":1845,"81":81}],1804:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"1767":1767,"1774":1774,"1775":1775,"1824":1824,"82":82}],1805:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"1767":1767,"1774":1774,"83":83}],1806:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"1795":1795,"1824":1824,"84":84}],1807:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"85":85}],1808:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"86":86}],1809:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"1838":1838,"87":87}],1810:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"88":88}],1811:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"89":89}],1812:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"1796":1796,"90":90}],1813:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"91":91}],1814:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"92":92}],1815:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"1814":1814,"1816":1816,"1828":1828,"93":93}],1816:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"94":94}],1817:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"95":95}],1818:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"1828":1828,"96":96}],1819:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"1822":1822,"97":97}],1820:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"1778":1778,"98":98}],1821:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"1814":1814,"1816":1816,"1823":1823,"1824":1824,"1839":1839,"1844":1844,"99":99}],1822:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"100":100,"1828":1828}],1823:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"101":101,"1816":1816,"1817":1817}],1824:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"102":102,"1816":1816,"1817":1817,"1826":1826}],1825:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"103":103,"1784":1784,"1826":1826}],1826:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"104":104,"1817":1817,"1843":1843}],1827:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"105":105}],1828:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"106":106}],1829:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"107":107,"1817":1817}],1830:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"108":108,"1816":1816,"1817":1817}],1831:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"109":109}],1832:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"110":110,"1760":1760,"1816":1816,"1842":1842}],1833:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"111":111,"1766":1766,"1800":1800}],1834:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"112":112,"1758":1758,"1765":1765,"1833":1833}],1835:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"113":113,"1779":1779,"1805":1805}],1836:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"114":114,"1780":1780,"1839":1839}],1837:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"115":115}],1838:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"116":116,"1816":1816,"1821":1821,"1826":1826,"1828":1828}],1839:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"117":117,"1814":1814,"1816":1816,"1823":1823,"1824":1824,"1828":1828,"1844":1844}],1840:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"118":118,"1758":1758,"1763":1763,"1771":1771,"1776":1776,"1795":1795,"1819":1819,"1820":1820,"1839":1839}],1841:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"119":119,"1758":1758,"1776":1776,"1795":1795,"1819":1819,"1820":1820}],1842:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120,"1794":1794,"1838":1838}],1843:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"121":121,"1792":1792}],1844:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"122":122}],1845:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"123":123}],1846:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"124":124}],1847:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"125":125,"1768":1768,"1787":1787}],1848:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"126":126}],1849:[function(require,module,exports){
arguments[4][731][0].apply(exports,arguments)
},{"731":731}],"/marty.js":[function(require,module,exports){
"use strict";

require(4);
require(2).polyfill();

var Marty = require(605);
var marty = new Marty("v0.10.0-beta", require("react"));

marty.use(require(619));
marty.use(require(128));
marty.use(require(1724));
marty.use(require(7));
marty.use(require(1350));
marty.use(require(1599));
marty.use(require(244));
marty.use(require(858));
marty.use(require(736));
marty.use(require(479));
marty.use(require(1222));
marty.use(require(1471));
marty.use(require(979));
marty.use(require(1101));

module.exports = marty;

},{"1101":1101,"1222":1222,"128":128,"1350":1350,"1471":1471,"1599":1599,"1724":1724,"2":2,"244":244,"4":4,"479":479,"605":605,"619":619,"7":7,"736":736,"858":858,"979":979,"undefined":undefined}]},{},[])("/marty.js")
});