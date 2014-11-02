module.exports = function (grunt) {
  grunt.config('concurrent', {
    serve: {
      tasks: ['browserify:watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  });
};