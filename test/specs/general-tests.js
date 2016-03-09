/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var expect   = require('chai').expect;
var FuelSoap = require('../../lib/fuel-soap');
var FuelAuth = require('fuel-auth');

describe('General Tests', function() {

	it('should be a constructor', function() {
		expect(FuelSoap).to.be.a('function');
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
			expect(err.message).to.equal('clientId or clientSecret is missing or invalid');
		}

		try {
			SoapClient = new FuelSoap(options);
		} catch (err) {
			expect(true).to.be.false;
		}

		// soap client should have an instance of an auth client
		expect(SoapClient.AuthClient instanceof FuelAuth).to.be.true;
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
			expect(true).to.be.false;
		}

		expect(SoapClient.AuthClient.test).to.be.true;
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

		expect(SoapClient.requestOptions.uri).to.equal('https://webservice.exacttarget.com/Service.asmx');

		options.soapEndpoint = 'https://www.exacttarget.com';

		// testing custom endpoint
		SoapClient = new FuelSoap(options);

		expect(SoapClient.requestOptions.uri).to.equal('https://www.exacttarget.com');
	});

	it('should have soapRequest on prototype', function() {
		expect(FuelSoap.prototype.soapRequest).to.be.a('function');
	});

	it('should have create on prototype', function() {
		expect(FuelSoap.prototype.create).to.be.a('function');
	});

	it('should have retrieve on prototype', function() {
		expect(FuelSoap.prototype.retrieve).to.be.a('function');
	});

	it('should have update on prototype', function() {
		expect(FuelSoap.prototype.update).to.be.a('function');
	});

	it('should have delete on prototype', function() {
		expect(FuelSoap.prototype.delete).to.be.a('function');
	});

	it('should have describe on prototype', function() {
		expect(FuelSoap.prototype.describe).to.be.a('function');
	});

	it('should have execute on prototype', function() {
		expect(FuelSoap.prototype.execute).to.be.a('function');
	});

	it('should have perform on prototype', function() {
		expect(FuelSoap.prototype.perform).to.be.a('function');
	});

	it('should have configure on prototype', function() {
		expect(FuelSoap.prototype.configure).to.be.a('function');
	});

	it('should have schedule on prototype', function() {
		expect(FuelSoap.prototype.schedule).to.be.a('function');
	});

	it('should have versionInfo on prototype', function() {
		expect(FuelSoap.prototype.versionInfo).to.be.a('function');
	});

	it('should have extract on prototype', function() {
		expect(FuelSoap.prototype.extract).to.be.a('function');
	});

	it('should have getSystemStatus on prototype', function() {
		expect(FuelSoap.prototype.getSystemStatus).to.be.a('function');
	});

	it('should have _buildEnvelope on prototype', function() {
		expect(FuelSoap.prototype._buildEnvelope).to.be.a('function');
	});

	it('should have _parseResponse on prototype', function() {
		expect(FuelSoap.prototype._parseResponse).to.be.a('function');
	});
});
