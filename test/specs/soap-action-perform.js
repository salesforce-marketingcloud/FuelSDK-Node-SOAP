/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert   = require('assert');
var FuelSoap = require('../../lib/fuel-soap');
var sinon    = require('sinon');

describe('SOAP Action - perform', function() {
	var soapRequestSpy;
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Perform' }
		, { property: 'key', expected: 'PerformResponseMsg' }
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
			FuelSoap.prototype.perform('Test', { data: true }, function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should call soapRequest with proper body', function() {
		// Act
		var sampleType  = 'TestType';
		var sampleDef = {'CustomerKey': 'DCL_Test'};
		FuelSoap.prototype.perform(sampleType, sampleDef, function() {});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.PerformRequestMsg.Action, 'start');
		assert.equal(soapRequestSpy.args[0][0].req.PerformRequestMsg.Definitions[0].Definition, sampleDef);
	});

	it('should pass callback to soapRequest', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.perform('Test', { data: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});
});
