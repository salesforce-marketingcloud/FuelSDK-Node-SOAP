/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert   = require('assert');
var FuelSoap = require('../../lib/fuel-soap');
var FuelAuth = require('fuel-auth');
var proxyquire = require('proxyquire');
var sinon = require('sinon');


describe('General Tests', function() {
	var requiredMethods;
	var initOptions;

	beforeEach(function() {
		initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};
	})

	it('should be a constructor', function() {
		assert.equal(typeof FuelSoap, 'function');
	});

	it('should require auth options', function() {
		var SoapClient;

		try {
			SoapClient = new FuelSoap();
		} catch (err) {
			assert.equal(err.message, 'clientId or clientSecret is missing or invalid');
		}

		try {
			SoapClient = new FuelSoap(initOptions);
		} catch (err) {
			assert.ok(false);
		}

		// soap client should have an instance of an auth client
		assert.ok(SoapClient.AuthClient instanceof FuelAuth);
	});

	it('should use already initiated fuel auth client', function() {
		var AuthClient;
		var SoapClient;

		try {
			AuthClient = new FuelAuth(initOptions.auth);

			AuthClient.test = true;

			SoapClient = new FuelSoap({ auth: AuthClient });

		} catch (err) {
			assert.ok(false);
		}

		assert.ok(SoapClient.AuthClient.test);
	});

	it('should take a custom soap endpoint', function() {
		// testing default initialization
		var SoapClient = new FuelSoap(initOptions);

		assert.equal(SoapClient.requestOptions.uri, 'https://webservice.exacttarget.com/Service.asmx');

		initOptions.soapEndpoint = 'https://www.exacttarget.com';

		// testing custom endpoint
		SoapClient = new FuelSoap(initOptions);

		assert.equal(SoapClient.requestOptions.uri, 'https://www.exacttarget.com');
	});

	it('should be able to add a custom header via reqOptions', function() {
		// Arrange
		var expected = { testing: 'MyHeaderHere' };
		var requestOptions = { headers: expected };
		var requestSpy = sinon.spy();
		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			request: requestSpy
		});
		var client = new FuelSoap(initOptions);
		sinon.stub(client.AuthClient, 'getAccessToken', function(opts, cb) {
			cb(null, { accessToken: 123456 });
		});

		// Act
		client.soapRequest({
			action: 'Retrieve',
			req: {},
			key: 'RetrieveResponseMsg',
			retry: true,
			reqOptions: requestOptions
		}, sinon.stub());

		// Assert
		assert.equal(requestSpy.args[0][0].headers.testing, expected.testing);
	});

	// Some methods are not here as they are tested elsewhere and their missing
	// would fail other tests. Eventually this will not be needed as methods are
	// full tested elsewhere
	requiredMethods = [
		'_parseResponse'
		, 'configure'
		, 'delete'
		, 'execute'
		, 'extract'
		, 'perform'
		, 'retrieve'
		, 'schedule'
		, 'soapRequest'
		, 'update'
		, 'versionInfo'
	];

	requiredMethods.forEach(function(method) {
		it('should have '+ method +' on prototype', function() {
			assert.equal(typeof FuelSoap.prototype[method], 'function');
		});
	});
});
