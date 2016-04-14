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

describe('parsing a response', function() {
	describe('handling errors from xml2js', function() {
		it('should execute callback with error if xml2js parseString returns an error', function() {
			// Arrange
			var sampleCallback = sinon.spy();
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
			var sampleCallback    = sinon.spy();
			var sampleDetail      = 'yep detail may go here';
			var sampleFaultCode   = 999;
			var sampleFaultString = 'yes this fault occured';
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
			expected.detail	             = sampleDetail;
			expected.errorPropagatedFrom = 'SOAP Fault';
			expected.faultCode	         = sampleFaultCode;
			expected.faultstring	     = sampleFaultString;

			// Act
			FuelSoap.prototype._parseResponse('key', { body: true }, sampleCallback);

			// Assert
			deepEqual(sampleCallback.args[0][0], expected);
		});
	});

	describe('delivering response when provided key is "DefinitionResponseMsg"', function() {
		it('should deliver DefinitionResponseMsg value from response', function() {
			// Arrange
			var sampleCallback = sinon.spy();
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

	describe('delivering response when provided key is "RetrieveResponseMsg"', function() {
		var successfulCallbackTestCases = ['OK', 'MoreDataAvailable'];

		successfulCallbackTestCases.forEach(function(testStatus) {
			it('should execute callback without error if OverallStatus === ' + testStatus, function() {
				// Arrange
				var sampleCallback = sinon.spy();
				var FuelSoap = proxyquire('../../lib/fuel-soap', {
					xml2js: {
						parseString: function(body, opts, cb) {
							cb(null, {
								'soap:Envelope': {
									'soap:Body': {
										'RetrieveResponseMsg': {
											Results: [{sampleResult: true}]
											, OverallStatus: testStatus
										}
									}
								}
							});
						}
					}
				});

				// Act
				FuelSoap.prototype._parseResponse('RetrieveResponseMsg', { body: true }, sampleCallback);

				// Assert
				assert.ok(sampleCallback.calledWith(null, sinon.match.object));
			});
		});

		it('should place parsed results into array if object is returned', function() {
			// Arrange
			var sampleCallback = sinon.spy();
			var FuelSoap = proxyquire('../../lib/fuel-soap', {
				xml2js: {
					parseString: function(body, opts, cb) {
						cb(null, {
							'soap:Envelope': {
								'soap:Body': {
									'RetrieveResponseMsg': {
										Results: {sampleResult: true}
										, OverallStatus: 'OK'
									}
								}
							}
						});
					}
				}
			});

			// Act
			FuelSoap.prototype._parseResponse('RetrieveResponseMsg', { body: true }, sampleCallback);

			// Assert
			assert.ok(Array.isArray(sampleCallback.args[0][1].Results));
		});

		it('should execute callback with error if successful statuses are not returend', function() {
			// Arrange
			var sampleCallback = sinon.spy();
			var sampleReqId    = 11;
			var sampleStatus   = 'NotASuccessFull:One';
			var FuelSoap = proxyquire('../../lib/fuel-soap', {
				xml2js: {
					parseString: function(body, opts, cb) {
						cb(null, {
							'soap:Envelope': {
								'soap:Body': {
									'RetrieveResponseMsg': {
										Results: [{sampleResult: true}]
										, OverallStatus: sampleStatus
										, RequestID: sampleReqId
									}
								}
							}
						});
					}
				}
			});

			var expected = new Error(sampleStatus.split(':')[1]);
			expected.errorPropagatedFrom = 'Retrieve Response';
			expected.requestId = sampleReqId;

			// Act
			FuelSoap.prototype._parseResponse('RetrieveResponseMsg', { body: true }, sampleCallback);

			// Assert
			deepEqual(sampleCallback.args[0][0], expected);
			assert.equal(sampleCallback.args[0][1], null);
		});
	});

	describe('delivering response when provided key is NOT "RetrieveResponseMsg" || "DefinitionResponseMsg"', function() {
		var errorCallbackTestCases = ['Error', 'Has Errors'];

		errorCallbackTestCases.forEach(function(testStatus) {
			it('should execute callback with error if OverallStatus === ' + testStatus, function() {
				// Arrange
				var sampleCallback = sinon.spy();
				var sampleReqId = 11;
				var sampleResults =  [{sampleResult: true}];
				var FuelSoap = proxyquire('../../lib/fuel-soap', {
					xml2js: {
						parseString: function(body, opts, cb) {
							cb(null, {
								'soap:Envelope': {
									'soap:Body': {
										'SomeOtherKey': {
											Results:sampleResults
											, OverallStatus: testStatus
											, RequestID: sampleReqId
										}
									}
								}
							});
						}
					}
				});

				var expected = new Error('Soap Error');
				expected.errorPropagatedFrom = 'SomeOtherKey';
				expected.requestId = sampleReqId;
				expected.results   = sampleResults;

				// Act
				FuelSoap.prototype._parseResponse('SomeOtherKey', { body: true }, sampleCallback);

				// Assert
				deepEqual(sampleCallback.args[0][0], expected);
				assert.equal(sampleCallback.args[0][1], null);
			});
		});

		it('should successfully execute callback when OverallStatus is not an error', function() {
			// Arrange
			var sampleCallback = sinon.spy();
			var sampleReqId    = 11;
			var sampleResults  = [{sampleResult: true}];
			var FuelSoap = proxyquire('../../lib/fuel-soap', {
				xml2js: {
					parseString: function(body, opts, cb) {
						cb(null, {
							'soap:Envelope': {
								'soap:Body': {
									'SomeOtherKey': {
										Results:sampleResults
										, OverallStatus: 'OK'
										, RequestID: sampleReqId
									}
								}
							}
						});
					}
				}
			});

			// Act
			FuelSoap.prototype._parseResponse('SomeOtherKey', { body: true }, sampleCallback);

			// Assert
			assert.ok(sampleCallback.calledWith(null, sinon.match.object));
		});
	});
});
