/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';
var assert     = require('assert');
var proxyquire = require('proxyquire');
var sinon      = require('sinon');

describe('handling errors after request has been made to API', function() {
	it('should deliever error response if request module errors', function() {
		// Arrange
		var soapClient;
		var callbackSpy = sinon.spy();
		var sampleError = { err: true };

		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			request: function(options, callback) {
				callback(sampleError, null, null);
			}
		});

		soapClient = new FuelSoap({
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		});

		soapClient._buildEnvelope = sinon.stub();
		sinon.stub(soapClient.AuthClient, 'getAccessToken').callsFake(function(options, cb) {
			cb(null, { accessToken: 12345 });
		});

		// Act
		soapClient.soapRequest({}, callbackSpy);

		// Assert (3 asserts are really against TDD, but it's testing the same thing basically)
		assert.ok(callbackSpy.calledWith(sampleError, null));
	});

	describe('handling errors that occur after _parseResponse has been called', function() {
		var soapClient;
		var requestSpy;
		var callbackSpy;
		var parseResponseError;

		beforeEach(function() {
			var FuelSoap = proxyquire('../../lib/fuel-soap', {
				'./helpers': {
					checkExpiredToken: sinon.stub().returns(true)
				},
				request: function(options, callback) {
					callback(null, null, {});
				}
			});

			callbackSpy        = sinon.spy();
			parseResponseError = new Error('_parseResponse Error');
			requestSpy         = sinon.spy(FuelSoap.prototype, 'soapRequest');
			soapClient = new FuelSoap({
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
			});

			soapClient._buildEnvelope = sinon.stub();
			sinon.stub(soapClient.AuthClient, 'getAccessToken').callsFake(function(options, cb) {
				cb(null, { accessToken: 12345 });
			});
			sinon.stub(soapClient, '_parseResponse').callsFake(function(key, body, cb) {
				cb(parseResponseError, null);
			});
		});

		it('should deliver error if _parseResponse function fails', function() {
			// Act
			soapClient.soapRequest({}, callbackSpy);

			// Assert
			assert.ok(callbackSpy.calledWith(parseResponseError, null));
		});

		it('should retry soap request', function() {
			// Act
			soapClient.soapRequest({ retry: true }, function() {});

			// Assert
			assert.ok(requestSpy.calledTwice);
		});
	});


});
