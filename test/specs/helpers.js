/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert  = require('assert');
var helpers = require('../../lib/helpers');
var sinon   = require('sinon');

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

// this needs to be removed upon refactoring. not sure what I was thinking at the time
describe('delivering response from either error or valid response', function() {
	it('should deliver valid response', function() {
		// Arrange
		var sampleData = 'test';
		var sampleCallback = sinon.spy();

		// Act
		helpers.deliverResponse('response', sampleData, sampleCallback);

		// Assert
		assert.ok(sampleCallback.calledWith(null, sampleData));
	});

	it('should deliver an error response', function() {
		// Arrange
		var sampleError = 'test';
		var sampleCallback = sinon.spy();

		// Act
		helpers.deliverResponse('error', sampleError, sampleCallback);

		// Assert
		assert.ok(sampleCallback.calledWith(sampleError, null));
	});

	it('should add propagated from info', function() {
		// Arrange
		var propagatedFrom = 'somewhere';
		var sampleError = {error: true};
		var sampleCallback = sinon.spy();

		// Act
		helpers.deliverResponse('error', sampleError, sampleCallback, propagatedFrom);

		// Assert
		assert.ok(sampleCallback.args[0][0].errorPropagatedFrom, propagatedFrom);
	});
});
