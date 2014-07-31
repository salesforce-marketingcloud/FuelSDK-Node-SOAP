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
				, 'test/**/*.js'
			]
		}
		, bump: {
			options: {
				files: [ 'package.json' ]
				, updateConfigs: [ 'pkg' ]
				, commit: true
				, commitMessage: 'Release %VERSION%'
				, commitFiles: [ 'package.json' ]
				, createTag: true
				, tagName: '%VERSION%'
				, tagMessage: '%VERSION%'
				, push: true
				, pushTo: 'origin'
				, gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-bump' );
	grunt.registerTask( 'default', [ 'jshint' ] );
};
