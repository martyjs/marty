var windowDefined = typeof window !== "undefined";

if (typeof global === "undefined" && windowDefined) {
  window.global = window;
}

require('es6-promise').polyfill();
require('isomorphic-fetch');

var Marty = require('marty-lib/modules/core/marty');
var marty = new Marty('0.11.0', react(), reactDomServer());

marty.use(require('marty-lib/modules/core'));
marty.use(require('marty-lib/modules/constants'));
marty.use(require('marty-lib/modules/application'));
marty.use(require('marty-lib/modules/store'));
marty.use(require('marty-lib/modules/action-creators'));
marty.use(require('marty-lib/modules/queries'));
marty.use(require('marty-lib/modules/state-mixin'));
marty.use(require('marty-lib/modules/app-mixin'));
marty.use(require('marty-lib/modules/container'));
marty.use(require('marty-lib/modules/http-state-source'));
marty.use(require('marty-lib/modules/cookie-state-source'));
marty.use(require('marty-lib/modules/location-state-source'));
marty.use(require('marty-lib/modules/session-storage-state-source'));
marty.use(require('marty-lib/modules/json-storage-state-source'));
marty.use(require('marty-lib/modules/local-storage-state-source'));

module.exports = marty;

function react() {
  try {
    return module.parent.require("react");
  } catch (e) {
    try {
      return require("react");
    } catch (e) {
      if (windowDefined && window.React) {
        return window.React;
      }
    }
  }

  throw new Error('Could not find React');
}

function reactDomServer() {
  try {
    return module.parent.require("react-dom/server");
  } catch (e) {
    try {
      return require("react-dom/server");
    } catch (e) {
      if (windowDefined) {
        if (!window.ReactDOMServer) {
          // Don't require ReactDOMServer in browser.
          return {};
        }

        return window.ReactDOMServer;
      }
    }
  }

  throw new Error('Could not find ReactDOMServer');
}
