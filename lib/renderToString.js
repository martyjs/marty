var React = require('react');
var _ = require('underscore');
var Context = require('./context');
var timeout = require('./utils/timeout');

var DEFAULT_TIMEOUT = 1000;

function renderToString(createElement, context, options) {
  var Marty = this;

  options = _.defaults(options || {}, {
    timeout: DEFAULT_TIMEOUT
  });

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

    var fetchData = Promise.race([
      renderToStringInContext(),
      timeout(options.timeout)
    ]);

    fetchData.then(function () {
      context.renderInContext(function () {
        try {
          var element = createElement();

          if (!element) {
            reject(new Error('createElement must return an element'));
            return;
          }

          var html = React.renderToString(element);
          html += dehydratedState(context);
          resolve(html);

          context.dispose();
        } catch (e) {
          reject(e);
          context.dispose();
        }
      });
    });

    function renderToStringInContext() {
      return context.renderInContext(function () {
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
      });
    }

    function dehydratedState(context) {
      var state = Marty.dehydrate(context);

      return `<script id="__marty-state">${state}</script>`;
    }
  });
}

module.exports = renderToString;