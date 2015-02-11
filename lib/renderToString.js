var React = require('react');
var _ = require('underscore');
var Context = require('./context');

function renderToString(createElement, context) {
  return new Promise(function (resolve, reject) {
    if (!_.isFunction(createElement)) {
      throw new Error('createElement must be a function');
    }
    if (!context) {
      reject(new Error('must pass in a context'));
      return;
    }

    if (!context instanceof Context) {
      reject(new Error('context must be an instance of Context'));
      return;
    }

    createElementInContext(context).then(function (element) {
      context.use(function () {
        resolve(React.renderToString(element));
      });
    });

    function createElementInContext(context) {
      return context.use(function () {
        var element = createElement();

        if (!element) {
          reject(new Error('createElement must return an element'));
          return;
        }

        React.renderToString(element);

        return element;
      });
    }
  });
}

module.exports = renderToString;