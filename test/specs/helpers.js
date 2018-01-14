/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
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
