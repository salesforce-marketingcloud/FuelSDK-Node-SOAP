/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

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
				, commitFiles: [ 'package.json', 'README.md' ]
				, createTag: true
				, tagName: '%VERSION%'
				, tagMessage: '%VERSION%'
				, push: true
				, pushTo: 'upstream'
				, gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-bump' );
	grunt.registerTask( 'default', [ 'jshint' ] );
};
