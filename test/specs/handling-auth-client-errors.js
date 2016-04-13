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
var FuelSoap;

describe('handling errors from auth client in soapRequest', function() {
	var deliverResponseSpy;
	var initOptions;

	beforeEach(function() {
		deliverResponseSpy = sinon.spy();

		initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};

		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'./helpers': {
				deliverResponse: deliverResponseSpy
			}
		});
	});

	it('should tell helpers to deliver error response when auth client returns error on access token fetch', function() {
		// Arrange
		var soapClient = new FuelSoap(initOptions);
		sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
			cb({ err: true }, null);
		});

		// Act
		soapClient.soapRequest({}, function() {});

		// Assert
		assert.ok(deliverResponseSpy.args[0][0], 'error');
		assert.ok(deliverResponseSpy.args[0][3], 'FuelAuth');
	});

	it('should tell helpers to deliver error response when auth client returns body without an access token', function() {
		// Arrange
		var soapClient = new FuelSoap(initOptions);
		sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
			cb(null, {});
		});

		// Act
		soapClient.soapRequest({}, function() {});

		// Assert
		assert.ok(deliverResponseSpy.args[0][1].message, 'No access token');
	});
});
