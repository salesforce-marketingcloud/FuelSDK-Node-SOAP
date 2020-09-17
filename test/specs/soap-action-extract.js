/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

var assert   = require('assert');
var FuelSoap = require('../../lib/fuel-soap');
var sinon    = require('sinon');

describe('SOAP Action - extract', function() {
	var soapRequestSpy;
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Extract' }
		, { property: 'key', expected: 'PerformExtractMsg' }
		, { property: 'retry', expected: true }
	];

	beforeEach(function() {
		soapRequestSpy = sinon.stub(FuelSoap.prototype, 'soapRequest');
	});

	afterEach(function() {
		FuelSoap.prototype.soapRequest.restore();
	});

	simpleVerifyTestCases.forEach(function(testCase) {
		it('should call soapRequest with correct ' + testCase.property, function() {
			// Act
			FuelSoap.prototype.extract({ data: true }, function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should call soapRequest with proper body', function() {
		// Act
		var sampleRequest = { data: true };
		FuelSoap.prototype.extract(sampleRequest, function() {});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.PerformExtractMsg.Requests, sampleRequest);
	});

	it('should pass callback to soapRequest', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.extract({ data: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});
});
