module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.loadTasks('./build/tasks');

  grunt.registerTask('default', 'serve');
  grunt.registerTask('serve', ['sass', 'copy:vendor', 'concurrent:serve']);
  grunt.registerTask('release', ['validate-repo', 'delete-dist', 'browserify:release', 'rev:assets', 'release:patch']);
};