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

// due to changes in API from v0.12 to v4
var deepEqual = assert.deepStrictEqual || assert.deepEqual;

describe('SOAP Action - create', function() {
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

	it('should use parameter in arg[2] as callback', function(done) {
		// Arrange
		var expected = 'param 3';

		// Assert
		sinon.stub(sampleClient, "soapRequest", function(options, callback) {
			assert.equal(callback(), expected);
			done();
		});

		// Act
		sampleClient.create('Email', { ID: 12345 }, function(){
			return expected;
		});
	});

	it('should use parameter in arg[3] as callback', function(done) {
		// Arrange
		var expected = 'param 4';

		// Assert
		sinon.stub(sampleClient, "soapRequest", function(options, callback) {
			assert.equal(callback(), expected);
			done();
		});

		// Act
		sampleClient.create('Email', { ID: 12345 }, {}, function(){
			return expected;
		});
	});

	it('should add the correct type to body in object CreateRequest.Objects.$', function() {
		// Arrange
		var type = 'Email';
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create(type, { ID: 12345 }, {}, function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.CreateRequest.Objects.$['xsi:type'], type);
	});

	it('should assign passed props in the body object to CreateRequest.Objects', function() {
		// Arrange
		var sampleProps = { ID: 12345 };
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', sampleProps, {}, function(){});

		// Assert
		deepEqual(soapRequestSpy.args[0][0].req.CreateRequest.Objects, sampleProps);
	});

	it('should assign passed options in the body object to CreateRequest.Options', function() {
		// Arrange
		var sampleOpts = { test: 12345 };
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, sampleOpts, function(){});

		// Assert
		deepEqual(soapRequestSpy.args[0][0].req.CreateRequest.Options, sampleOpts);

	});

	it('should call soapRequest with action of "Create"', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, {}, function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].action, 'Create');
	});

	it('should call soapRequest with key of "CreateResponse"', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, {}, function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].key, 'CreateResponse');
	});

	it('should call soapRequest with retry of true', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, {}, function(){});

		// Assert
		assert.ok(soapRequestSpy.args[0][0].retry);
	});

	it('should call soapRequest with reqOptions', function() {
		// Arrange
		var options = { reqOptions: { test: true } };
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, options, function(){});

		// Assert
		assert.ok(soapRequestSpy.args[0][0].reqOptions.test);
	});

	it('should add QueryAllAccounts to body -> CreateRequest -> Options', function() {
		// Arrange
		var soapRequestOptions = { queryAllAccounts: true };
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, soapRequestOptions, function(){});

		// Assert
		assert.ok(soapRequestSpy.args[0][0].req.CreateRequest.Options.QueryAllAccounts);
	});

	it('should not add QueryAllAccounts to body -> CreateRequest -> Options', function() {
		// Arrange
		var soapRequestSpy = sinon.stub(sampleClient, 'soapRequest');

		// Act
		sampleClient.create('Email', { ID: 12345 }, {}, function(){});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.CreateRequest.Options, null);
	});
});
