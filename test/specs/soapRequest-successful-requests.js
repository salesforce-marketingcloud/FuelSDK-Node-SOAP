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
var FuelSoap   = require('../../lib/fuel-soap');

describe('soapRequest (function that actually makes API request)', function() {
	describe('requiring proper args', function() {
		it('should throw if no callback passed', function() {
			// Arrange
			var error = null;

			// Act
			try {
				FuelSoap.prototype.soapRequest({});
			} catch(err) {
				error = err;
			}

			// Assert
			assert.ok(error);
		});

		it('should throw if no options passed', function() {
			// Arrange
			var error = null;

			// Act
			try {
				FuelSoap.prototype.soapRequest(null, function() {});
			} catch(err) {
				error = err;
			}

			// Assert
			assert.ok(error);
		});
	});

	describe('correct options passed to request module', function() {
		var MockedFuelSoap;
		var sampleClient;
		var requestModuleSpy;

		beforeEach(function() {
			requestModuleSpy = sinon.spy();

			MockedFuelSoap = proxyquire('../../lib/fuel-soap', {
				request: requestModuleSpy
			});

			sampleClient = new MockedFuelSoap({ auth: { clientId: 'testing', clientSecret: 'testing' }});

			sinon.stub(sampleClient.AuthClient, 'getAccessToken', function(opts, cb) {
				cb(null, { accessToken: 12345 });
			});
		});

		it('should call request module with proper SOAPAction header', function() {
			// Arrange
			var sampleAction = '<sample action>';

			// Act
			sampleClient.soapRequest({ action: sampleAction }, sinon.stub());

			// Assert
			assert.equal(requestModuleSpy.args[0][0].headers.SOAPAction, sampleAction);
		});

		it('should be able to add custom headers', function() {
			// Arrange
			var customHeaders = {
				test: '<sample header>'
			};

			// Act
			sampleClient.soapRequest({
				reqOptions: {
					headers: customHeaders
				}
			}, sinon.stub());

			// Assert
			assert.equal(requestModuleSpy.args[0][0].headers.test, customHeaders.test);
		});

		it('should assign request body the result of _buildEnvelope', function() {
			// Arrange
			var buildEnvelopeResult = { body: true, data: true };

			sinon.stub(sampleClient, '_buildEnvelope', function() {
				return buildEnvelopeResult;
			});

			// Act
			sampleClient.soapRequest({}, sinon.stub());

			// Assert
			assert(requestModuleSpy.args[0][0].body, buildEnvelopeResult);
		});

		it('should deliver a response when no errors are encountered', function() {
			// Arrange
			var callbackSpy         = sinon.spy();
			var parseResponseData   = { parseResData: true };
			var requestResponseData = { responseData: true };
			var LocalMockedFuelSoap = proxyquire('../../lib/fuel-soap', {
				request: function(options, callback) {
					callback(null, requestResponseData, { body: true });
				}
			});

			var localSampleClient = new LocalMockedFuelSoap({ auth: { clientId: 'testing', clientSecret: 'testing' }});

			localSampleClient._buildEnvelope = sinon.stub();
			sinon.stub(localSampleClient.AuthClient, 'getAccessToken', function(options, cb) {
				cb(null, { accessToken: 12345 });
			});
			sinon.stub(localSampleClient, '_parseResponse', function(key, body, cb) {
				cb(null, parseResponseData);
			});

			// Act
			localSampleClient.soapRequest({}, callbackSpy);

			// Assert
			assert.ok(callbackSpy.calledWith(null, { body: parseResponseData, res: requestResponseData }));
		});
	});
});
