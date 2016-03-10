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

describe('SOAP Action describe', function() {
	var initOptions;
	var sampleClient;

	beforeEach(function() {
		initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, soapEndpoint: 'https://myendpoint.com'
		};

		sampleClient = new FuelSoap(initOptions);
	});

	afterEach(function() {
		sampleClient.soapRequest.restore();
	});

	it('should call soapRequest with action of "Describe"', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.describe('Email', function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].action, 'Describe');
	});

	it('should call soapRequest with key of "DefinitionResponseMsg"', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.describe('Email', function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].key, 'DefinitionResponseMsg');
	});

	it('should call soapRequest with retry of true', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.describe('Email', function(){});

		// Assert
		assert.ok(soapRequestSpy.args[0][0].retry);
	});

	it('should add type to the proper location in the body', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');
		var actual;
		var type = 'Email';

		// Act
		sampleClient.describe(type, function(){});

		// this is the proper location. holy shit it's a doozy
		actual = soapRequestSpy.args[0][0].req.DefinitionRequestMsg.DescribeRequests.ObjectDefinitionRequest.ObjectType;

		// Assert
		assert.equal(actual, type);
	});
});
