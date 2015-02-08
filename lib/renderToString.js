var React = require('react');
var _ = require('underscore');
var Context = require('./context');

function renderToString(createElement, context) {
  return new Promise(function (resolve) {
    if (!_.isFunction(createElement)) {
      throw new Error('createElement must be a function');
    }

    if (!context) {
      throw new Error('must pass in a context');
    }

    if (!context instanceof Context) {
      throw new Error('context must be an instance of Context');
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
          throw new Error('createElement must return an element');
        }

        React.renderToString(element);

        return element;
      });
    }
  });
}

module.exports = renderToString;