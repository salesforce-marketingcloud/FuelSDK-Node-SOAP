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

describe('SOAP Action - execute', function() {
	var soapRequestSpy;
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Execute' }
		, { property: 'key', expected: 'ExecuteResponseMsg' }
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
			FuelSoap.prototype.execute('Test', { data: true }, function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should call soapRequest with proper body', function() {
		// Act
		var sampleType  = 'TestType';
		var sampleProps = { data: true };
		FuelSoap.prototype.execute(sampleType, sampleProps, function() {});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.ExecuteRequestMsg.Requests.Name, sampleType);
		assert.equal(soapRequestSpy.args[0][0].req.ExecuteRequestMsg.Requests.Parameters, sampleProps);
	});

	it('should pass callback to soapRequest', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.execute('Test', { data: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});
});
