/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';
var assert   = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

// due to changes in API from v0.12 to v4
var deepEqual = assert.deepStrictEqual || assert.deepEqual;

describe('handling errors from xml2js', function() {
	it('should execute callback with error if xml2js parseString returns an error', function() {
		// Arrange
		var sampleCallback = sinon.stub();
		var sampleError = {err:true};
		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			xml2js: {
				parseString: function(body, opts, cb) {
					cb(sampleError, null);
				}
			}
		});

		// Act
		FuelSoap.prototype._parseResponse('key', { body: true }, sampleCallback);

		// Assert
		assert.ok(sampleCallback.calledWith(sampleError, null));
	});
});

describe('handling a soap body response with a fault', function() {
	it('should execute callback with proper error regarding the fault that occured', function() {
		// Arrange
		var sampleCallback = sinon.stub();
		var sampleFaultString = 'yes this fault occured';
		var sampleFaultCode = 999;
		var sampleDetail = 'yep detail may go here';
		var sampleResponse = {
			'soap:Envelope': {
				'soap:Body': {
					'soap:Fault': {
						faultcode: sampleFaultCode
						, faultstring: sampleFaultString
						, detail: sampleDetail
					}
				}
			}
		};

		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			xml2js: {
				parseString: function(body, opts, cb) {
					cb(null, sampleResponse);
				}
			}
		});

		var expected = new Error(sampleFaultString);
		expected.detail              = sampleDetail;
		expected.errorPropagatedFrom = 'SOAP Fault';
		expected.faultCode           = sampleFaultCode;
		expected.faultstring         = sampleFaultString;

		// Act
		FuelSoap.prototype._parseResponse('key', { body: true }, sampleCallback);

		// Assert
		deepEqual(sampleCallback.args[0][0], expected);
	});
});

describe('delievering response when provided key is "DefinitionResponseMsg"', function() {
	it('should deliver DefinitionResponseMsg value from response', function() {
		// Arrange
		var sampleCallback = sinon.stub();
		var sampleDefinitionResponseMsg = { data: true, thisIsGood: true, ObjectDefinition: { more: true } };

		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			xml2js: {
				parseString: function(body, opts, cb) {
					cb(null, {
						'soap:Envelope': {
							'soap:Body': {
								'DefinitionResponseMsg': sampleDefinitionResponseMsg
							}
						}
					});
				}
			}
		});

		// Act
		FuelSoap.prototype._parseResponse('DefinitionResponseMsg', { body: true }, sampleCallback);

		// Assert
		deepEqual(sampleCallback.args[0][1], sampleDefinitionResponseMsg);
	});

	it('should default ObjectDefinition to empty object if not returned', function() {
		// Arrange
		var sampleCallback = sinon.stub();
		var sampleDefinitionResponseMsg = { data: true, thisIsGood: true };

		var FuelSoap = proxyquire('../../lib/fuel-soap', {
			xml2js: {
				parseString: function(body, opts, cb) {
					cb(null, {
						'soap:Envelope': {
							'soap:Body': {
								'DefinitionResponseMsg': sampleDefinitionResponseMsg
							}
						}
					});
				}
			}
		});

		// Act
		FuelSoap.prototype._parseResponse('DefinitionResponseMsg', { body: true }, sampleCallback);

		// Assert
		assert.equal(Object.prototype.toString.call(sampleCallback.args[0][1].ObjectDefinition), "[object Object]");
	});
});
