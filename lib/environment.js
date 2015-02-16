var _ = require('underscore');
var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'server' : 'browser';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};