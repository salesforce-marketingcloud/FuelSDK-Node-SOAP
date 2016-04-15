/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert     = require('assert');
var proxyquire = require('proxyquire');
var sinon      = require('sinon');

describe('SOAP Action - delete', function() {
	var FuelSoap;
	var soapRequestSpy;
	var parsedOptions = { parsedOptions: true };
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Delete' }
		, { property: 'key', expected: 'DeleteResponse' }
		, { property: 'retry', expected: true }
		, { property: 'reqOptions', expected: parsedOptions }
	];

	beforeEach(function() {
		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'./helpers': {
				parseReqOptions: function() { return parsedOptions; }
			}
		});
		soapRequestSpy = sinon.stub(FuelSoap.prototype, 'soapRequest');
	});

	afterEach(function() {
		FuelSoap.prototype.soapRequest.restore();
	});

	simpleVerifyTestCases.forEach(function(testCase) {
		it('should call soapRequest with correct ' + testCase.property, function() {
			// Act
			FuelSoap.prototype.delete('Test', { props: true }, { options: true }, function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should pass correct body to soapRequest', function() {
		// Arrange
		var sampleOptions = { options: true, moar: false };
		var sampleProps   = { props: true };

		// Act
		FuelSoap.prototype.delete('Test', sampleProps, sampleOptions, function() {});

		// Assert
		var actualObj = soapRequestSpy.args[0][0].req;
		assert.equal(actualObj.DeleteRequest.Options, sampleOptions);
		assert.equal(actualObj.DeleteRequest.Objects, sampleProps);
		assert.ok(!actualObj.DeleteRequest.Options.QueryAllAccounts);
	});

	it('should pass callback to soapRequest when props', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.delete('Test', { data: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});

	it('should pass callback to soapRequest when props and options', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.delete('Test', { data: true }, { options: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});

	it('should add QueryAllAccounts to body when option passed', function() {
		// Arrange
		var sampleOptions = { queryAllAccounts: true };
		var sampleProps   = { props: true };

		// Act
		FuelSoap.prototype.delete('Test', sampleProps, sampleOptions, function() {});

		// Assert
		var actualObj = soapRequestSpy.args[0][0].req;
		assert.ok(actualObj.DeleteRequest.Options.QueryAllAccounts);
	});
});
