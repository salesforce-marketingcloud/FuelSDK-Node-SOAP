module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      }
      , all: [
        'Gruntfile.js'
        , 'lib/**/*.js'
        , 'test/app/js'
      ]
    }
  });

  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.registerTask( 'default', [ 'jshint' ] );
};