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
		sinon.stub(soapClient.AuthClient, 'getAccessToken').callsFake(function(options, cb) {
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
		sinon.stub(soapClient.AuthClient, 'getAccessToken').callsFake(function(options, cb) {
			cb(null, {});
		});

		// Act
		soapClient.soapRequest({}, callbackSpy);

		// Assert
		assert.ok(callbackSpy.args[0][0].message, 'No access token');
	});
});
