let React = require('./react');
let Context = require('./context');
let ContextComponent = require('./components/context');

function renderToString(options) {
  options = options || {};

  let Marty = this;
  let context = options.context;
  let fetchOptions = { timeout: options.timeout };

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
          let element = createElement();

          if (!element) {
            reject(new Error('createElement must return an element'));
            return;
          }

          let html = React.renderToString(element);
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
          let element = createElement();

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
      let element = React.createElement(ContextComponent, {
        context: context,
        subject: {
          type: options.type,
          props: options.props
        }
      });

      return element;
    }

    function dehydratedState(context) {
      let state = Marty.dehydrate(context);

      return `<script id="__marty-state">${state}</script>`;
    }
  });
}

module.exports = renderToString;