/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert  = require('assert');
var helpers = require('../../lib/helpers');

describe('checking the fault string on an error response', function() {
	it('should return true if faultstring is "Token Expired"', function() {
		// Arrange
		var sampleError = {
			faultstring: 'Token Expired'
		};

		// Assert
		assert.ok(helpers.checkExpiredToken(sampleError));
	});

	it('should return false if error doesn\'t have a faultstring', function() {
		// Arrange
		var sampleError = {};

		// Assert
		assert.ok(!helpers.checkExpiredToken(sampleError));
	});

	it('should return false if faultstring does not related to expired token', function() {
		// Arrange
		var sampleError = { faultstring: 'Testing something else' };

		// Assert
		assert.ok(!helpers.checkExpiredToken(sampleError));
	});
});
