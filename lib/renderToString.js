var React = require('react');
var _ = require('underscore');
var Context = require('./context');
var timeout = require('./utils/timeout');
var ContextComponent = require('./contextComponent');

var DEFAULT_TIMEOUT = 1000;

function renderToString(type, props, context, options = {}) {
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
      context.fetchData(function () {
        try {
          var element = createElement();

          if (!element) {
            reject(new Error('createElement must return an element'));
            return;
          }

          var html = React.renderToString(element);
          html += dehydratedState(context);
          resolve(html);
        } catch (e) {
          reject(e);
        } finally {
          context.dispose();
        }
      });
    });

    function renderToStringInContext() {
      return context.fetchData(function () {
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


    function createElement() {
      var element = React.createElement(ContextComponent, {
        context: context,
        subject: {
          type: type,
          props: props
        }
      });

      return element;
    }

    function dehydratedState(context) {
      var state = Marty.dehydrate(context);

      return `<script id="__marty-state">${state}</script>`;
    }
  });
}

module.exports = renderToString;