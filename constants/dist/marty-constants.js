(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MartyConstants = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

module.exports = arrayToConstants;

var _createActionCreator = require('./create-action-creator');

var createActionCreator = _interopRequire(_createActionCreator);

function arrayToConstants(array) {
  var constants = {};

  array.forEach(function (actionType) {
    var types = [actionType, '' + actionType + '_DONE', '' + actionType + '_FAILED', '' + actionType + '_STARTING'];

    types.forEach(function (type) {
      return constants[type] = createActionCreator(type);
    });
  });

  return constants;
}

},{"./create-action-creator":2}],2:[function(require,module,exports){
'use strict';

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = createActionCreator;

var _isFunction = require('lodash/lang/isFunction');

var isFunction = _interopRequire(_isFunction);

var _logger$warnings = require('marty-utils');

function createActionCreator(actionType) {
  var constantActionCreator = function constantActionCreator(actionCreator) {
    if (_logger$warnings.warnings.invokeConstant) {
      _logger$warnings.logger.warn('Warning: Invoking constants has been depreciated.\n                  Please migrate to new style of creating action creators\n                  http://martyjs.org/guides/action-creators/migrating-from-v8.html');
    }

    if (!isFunction(actionCreator)) {
      actionCreator = function autoDispatch() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this.dispatch.apply(this, args);
      };
    }

    return function actionContextCreator() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var context = actionContext(this);

      actionCreator.apply(context, args);

      function actionContext(creators) {
        return _extends({}, creators, {
          dispatch: function dispatch() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            args.unshift(actionType);
            creators.dispatch.apply(creators, args);
          }
        });
      }
    };
  };

  Object.defineProperties(constantActionCreator, {
    isActionCreator: { value: true },
    toString: { value: function value() {
        return actionType;
      } },
    type: { value: actionType }
  });

  return constantActionCreator;
}

},{"lodash/lang/isFunction":undefined,"marty-utils":undefined}],3:[function(require,module,exports){
'use strict';

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

module.exports = constants;

var _arrayToConstants = require('./array-to-constants');

var arrayToConstants = _interopRequire(_arrayToConstants);

var _isObject = require('lodash/lang/isObject');

var isObject = _interopRequire(_isObject);

function constants(obj) {
  var ret = {};

  if (Array.isArray(obj)) {
    ret = arrayToConstants(obj);
  } else if (isObject(obj)) {
    Object.keys(obj).forEach(function (actionType) {
      return ret[actionType] = constants(obj[actionType]);
    });
  }

  return ret;
}

},{"./array-to-constants":1,"lodash/lang/isObject":undefined}]},{},[3])(3)
});