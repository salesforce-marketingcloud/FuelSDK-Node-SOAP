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

describe('handling errors after request has been made to API', function() {
	var deliverResponseSpy;

	beforeEach(function() {
		deliverResponseSpy = sinon.spy();
	});

	it('should tell helpers to deliever response if request module errors', function() {
		// Arrange
		var soapClient;

		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			'./helpers': {
				deliverResponse: deliverResponseSpy
			},
			'request': function(options, callback) {
				callback({ data: 'not null' }, null, null);
			}
		});

		soapClient = new FuelSoap({
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		});

		soapClient._buildEnvelope = sinon.stub();
		sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
			cb(null, { accessToken: 12345 });
		});

		// Act
		soapClient.soapRequest({}, function() {});

		// Assert (3 asserts are really against TDD, but it's testing the same thing basically)
		assert.ok(deliverResponseSpy.calledOnce);
		assert.equal(deliverResponseSpy.args[0][0], 'error');
		assert.equal(deliverResponseSpy.args[0][3], 'Request Module inside soapRequest');
	});

	describe('handling errors that occur after _parseResponse has been called', function() {
		var soapClient;
		var requestSpy;

		beforeEach(function() {
			var FuelSoap = proxyquire('../../lib/fuel-soap', {
				'./helpers': {
					deliverResponse: deliverResponseSpy
					, checkExpiredToken: sinon.stub().returns(true)
				},
				'request': function(options, callback) {
					callback(null, null, {});
				}
			});

			requestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');
			soapClient = new FuelSoap({
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
			});

			soapClient._buildEnvelope = sinon.stub();
			sinon.stub(soapClient.AuthClient, 'getAccessToken', function(options, cb) {
				cb(null, { accessToken: 12345 });
			});
			sinon.stub(soapClient, '_parseResponse', function(key, body, cb) {
				cb({ err: true }, null);
			});
		});

		it('should deliver error if _parseResponse function fails', function() {
			// Act
			soapClient.soapRequest({}, function() {});

			// Assert (3 asserts are really against TDD, but it's testing the same thing basically)
			assert.ok(deliverResponseSpy.calledOnce);
			assert.equal(deliverResponseSpy.args[0][0], 'error');
			assert.equal(deliverResponseSpy.args[0][3], 'soapRequest > request > _parseResponse');
		});

		it('should retry soap request', function() {
			// Act
			soapClient.soapRequest({ retry: true }, function() {});

			// Assert
			assert.ok(requestSpy.calledTwice);
		});
	});


});
