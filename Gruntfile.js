/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
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
