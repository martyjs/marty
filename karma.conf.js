var fs = require('fs');
var _ = require('lodash');
var yaml = require('js-yaml');

module.exports = function (config) {
  process.env.NODE_ENV = 'test';

  switch (process.env.ENV) {
    case 'CI':
      _.extend(process.env, saucelabsVariables());
      config.set(saucelabs());
      break;
    case 'IE':
      _.extend(process.env, saucelabsVariables());

      config.set(_.extend(saucelabs(), {
        customLaunchers: {
          sl_ie_11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
          }
        },
        browsers: ['sl_ie_11']
      }));
      break;
    default:
      config.set(local());
      break;
  }

  function saucelabs() {
    var customLaunchers = {
      sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        version: '38'
      },
      sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '33'
      },
      sl_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        version: '5'
      },
      sl_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      sl_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    };

    return _.extend(base(), {
      sauceLabs: {
        testName: 'Marty Tests'
      },
      browserDisconnectTimeout : 10000,
      browserDisconnectTolerance : 1,
      browserNoActivityTimeout : 4 * 60 * 1000,
      captureTimeout : 4 * 60 * 1000,
      customLaunchers: customLaunchers,
      browsers: Object.keys(customLaunchers),
      reporters: ['dots', 'saucelabs'],
      singleRun: true
    });
  }

  function local() {
    return _.extend(base(), {
      reporters: ['spec'],
      browsers: ['Chrome'],
      autoWatch: true,
      singleRun: false,
      colors: true
    });
  }

  function base() {
    return {
      basePath: '',
      frameworks: ['mocha', 'browserify'],
      browserify: {
        transform: ['babelify'],
        debug: true
      },
      files: [
        'marty.js',
        'lib/*.js',
        'test/browser/**/*.js'
      ],
      exclude: [
        'test/browser/lib/mockServer.js'
      ],
      preprocessors: {
        'lib/*': ['browserify'],
        'marty.js': ['browserify'],
        'test/browser/**/*.js': ['browserify']
      },
      port: 9876,
      proxies: {
        '/stub': 'http://localhost:8956/stub'
      },
      logLevel: config.LOG_INFO,
    };
  }

  function saucelabsVariables() {
    return _.pick(travisGlobalVariables(), 'SAUCE_USERNAME', 'SAUCE_ACCESS_KEY');

    function travisGlobalVariables() {
      var config = {};
      var travis = yaml.safeLoad(fs.readFileSync('./.travis.yml', 'utf-8'));

      travis.env.global.forEach(function (variable) {
        var parts = /(.*)="(.*)"/.exec(variable);

        config[parts[1]] = parts[2];
      });

      return config;
    }
  }
};
