var React = require('./react');
var _ = require('./utils/mindash');
var Context = require('./context');
var ContextComponent = require('./components/context');

var MAX_NUMBER_OF_ITERATIONS = 10;

function renderToString(options) {
  options = _.defaults(options || {}, {
    maxNumberOfIterations: MAX_NUMBER_OF_ITERATIONS
  });

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

    if (!(context instanceof Context)) {
      reject(new Error('context must be an instance of Context'));
      return;
    }

    var totalIterations = 0;

    resolveFetches().then(dehydrateAndRenderHtml);

    // Repeatedly re-render the component tree until
    // we no longer make any new fetches
    function resolveFetches(prevDiagnostics) {
      return waitForFetches(prevDiagnostics).then(function (diagnostics) {
        if (diagnostics.numberOfNewFetchesMade === 0 ||
            totalIterations > options.maxNumberOfIterations) {
          return diagnostics;
        } else {
          totalIterations++;
          return resolveFetches(diagnostics);
        }
      });
    }

    function waitForFetches(prevDiagnostics) {
      var options = _.extend({
        prevDiagnostics: prevDiagnostics
      }, fetchOptions);

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
      }, options);
    }

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
            diagnostics: diagnostics.toJSON()
          });
        } catch (e) {
          reject(e);
        } finally {
          context.dispose();
        }
      }, fetchOptions);
    }

    function createElement() {
      var element = React.createElement(ContextComponent, {
        context: context,
        subject: {
          type: options.type,
          props: options.props
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
