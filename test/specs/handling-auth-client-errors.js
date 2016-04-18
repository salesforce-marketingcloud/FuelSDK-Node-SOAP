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

describe('handling errors from auth client in soapRequest', function() {
	var initOptions;

	beforeEach(function() {
		initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};
	});

	it('should deliver error response when auth client returns error on access token fetch', function() {
		// Arrange
		var callbackSpy = sinon.spy();
		var sampleError = new Error('whatever error here');
		var soapClient = new FuelSoap(initOptions);
		sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
			cb(sampleError, null);
		});

		// Act
		soapClient.soapRequest({}, callbackSpy);

		// Assert
		assert.ok(callbackSpy.calledWith(sampleError, null));
	});

	it('should deliver error response when auth client returns body without an access token', function() {
		// Arrange
		var callbackSpy = sinon.spy();
		var soapClient = new FuelSoap(initOptions);
		sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
			cb(null, {});
		});

		// Act
		soapClient.soapRequest({}, callbackSpy);

		// Assert
		assert.ok(callbackSpy.args[0][0].message, 'No access token');
	});
});
