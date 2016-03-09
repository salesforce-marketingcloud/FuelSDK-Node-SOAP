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

describe('General Tests', function() {

	it('should be a constructor', function() {
		assert.equal(typeof FuelSoap, 'function');
	});

	it('should require auth options', function() {
		var SoapClient;
		var options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};

		try {
			SoapClient = new FuelSoap();
		} catch (err) {
			assert.equal(err.message, 'clientId or clientSecret is missing or invalid');
		}

		try {
			SoapClient = new FuelSoap(options);
		} catch (err) {
			assert.ok(false);
		}

		// soap client should have an instance of an auth client
		assert.ok(SoapClient.AuthClient instanceof FuelAuth);
	});

	it('should use already initiated fuel auth client', function() {
		var AuthClient, SoapClient;
		var authOptions = {
			clientId: 'testing'
			, clientSecret: 'testing'
		};
		try {
			AuthClient = new FuelAuth(authOptions);

			AuthClient.test = true;

			SoapClient = new FuelSoap({ auth: AuthClient });

		} catch (err) {
			assert.ok(false);
		}

		assert.ok(SoapClient.AuthClient.test);
	});

	it('should take a custom soap endpoint', function() {
		var options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};

		// testing default initialization
		var SoapClient = new FuelSoap(options);

		assert.equal(SoapClient.requestOptions.uri, 'https://webservice.exacttarget.com/Service.asmx');

		options.soapEndpoint = 'https://www.exacttarget.com';

		// testing custom endpoint
		SoapClient = new FuelSoap(options);

		assert.equal(SoapClient.requestOptions.uri, 'https://www.exacttarget.com');
	});

	it('should have soapRequest on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.soapRequest, 'function');
	});

	it('should have create on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.create, 'function');
	});

	it('should have retrieve on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.retrieve, 'function');
	});

	it('should have update on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.update, 'function');
	});

	it('should have delete on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.delete, 'function');
	});

	it('should have describe on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.describe, 'function');
	});

	it('should have execute on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.execute, 'function');
	});

	it('should have perform on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.perform, 'function');
	});

	it('should have configure on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.configure, 'function');
	});

	it('should have schedule on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.schedule, 'function');
	});

	it('should have versionInfo on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.versionInfo, 'function');
	});

	it('should have extract on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.extract, 'function');
	});

	it('should have getSystemStatus on prototype', function() {
		assert.equal(typeof FuelSoap.prototype.getSystemStatus, 'function');
	});

	it('should have _buildEnvelope on prototype', function() {
		assert.equal(typeof FuelSoap.prototype._buildEnvelope, 'function');
	});

	it('should have _parseResponse on prototype', function() {
		assert.equal(typeof FuelSoap.prototype._parseResponse, 'function');
	});
});
