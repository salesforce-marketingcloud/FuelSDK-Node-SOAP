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

describe('SOAP Action - describe', function() {
	var soapRequestSpy;
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Describe' }
		, { property: 'key', expected: 'DefinitionResponseMsg' }
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
			FuelSoap.prototype.describe('Test', function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should add type to the proper location in the body', function() {
		// Arrange
		var actual;
		var type = 'Email';

		// Act
		FuelSoap.prototype.describe(type, function(){});

		// this is the proper location. holy shit it's a doozy
		actual = soapRequestSpy.args[0][0].req.DefinitionRequestMsg.DescribeRequests.ObjectDefinitionRequest.ObjectType;

		// Assert
		assert.equal(actual, type);
	});
});
