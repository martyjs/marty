var windowDefined = typeof window !== 'undefined';
var environment = windowDefined ? 'browser' : 'server';

module.exports = {
  environment: environment,
  isServer: environment === 'server',
  isBrowser: environment === 'browser'
};