var _ = require('lodash');

module.exports = function (grunt) {
  var DEFAULT_OPTIONS = {
    src: ['client/main.js'],
    dest: 'dist/marty.js',
    options: {
      transform: ['reactify', 'brfs', 'browserify-shim'],
      browserifyOptions: {
        debug: true
      }
    }
  };

  grunt.config('browserify', {
    dev: options(),
    watch: options({
      options: {
        watch: true,
        keepAlive: true,
        browserifyOptions: {
          debug: true
        }
      }
    }),
    release: options({
      options: {
        browserifyOptions: {
          debug: false
        }
      }
    })
  });

  function options(locals) {
    return _.merge(locals || {}, DEFAULT_OPTIONS);
  }
};