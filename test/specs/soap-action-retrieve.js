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

describe('SOAP Action - retrieve', function() {
	var FuelSoap;
	var soapRequestSpy;
	var parsedOptions = { parsedOptions: true };
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Retrieve' }
		, { property: 'key', expected: 'RetrieveResponseMsg' }
		, { property: 'retry', expected: true }
		, { property: 'reqOptions', expected: parsedOptions }
	];

	beforeEach(function() {
		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'./helpers': {
				parseReqOptions: function() { return parsedOptions; }
			}
		});
		soapRequestSpy = sinon.stub(FuelSoap.prototype, 'soapRequest');
	});

	afterEach(function() {
		FuelSoap.prototype.soapRequest.restore();
	});

	simpleVerifyTestCases.forEach(function(testCase) {
		it('should call soapRequest with correct ' + testCase.property, function() {
			// Act
			FuelSoap.prototype.retrieve('Test', { props: true }, { options: true }, function() {});

			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should have correct ObjectType in RetrieveRequestMsg > RetrieveRequest', function() {
		// Arrange
		var sampleType = '<sample type>';

		// Act
		FuelSoap.prototype.retrieve(sampleType, { props: true }, { options: true }, function() {});

		// Assert
		assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.ObjectType, sampleType);
	});


	describe('callback placement - data validation', function() {
		describe('argument 1 (0 based index)', function() {
			it('should set default props', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', function() {});

				// Assert
				assert.deepEqual(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Properties, ['Client', 'ID', 'ObjectID']);
			});

			it('should set ClientIDs to null in body (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.ClientIDs, null);
			});

			it('should set Filter to null in body (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Filter, null);
			});
		});

		describe('argument 2 (0 based index)', function() {
			// the position of the callback here means that there are no
			// props and the arugment in args[1] is supposed to be be "options"
			// it's not written this way, but it will be

			beforeEach(function() {
				sinon.stub(FuelSoap.prototype, '_parseFilter', function(filter) { return filter; });
			});

			afterEach(function() {
				FuelSoap.prototype._parseFilter.restore();
			});

			it('should set ClientIDs to null in body if second arg is not an object (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', 'string', function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.ClientIDs, null);
			});

			it('should set Filter to null in body if second arg is not an object (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', 'string', function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Filter, null);
			});

			it('should set Properties to second arg in body if second arg is not an object (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Arrange
				var sampleSecondArg = 'string';

				// Act
				FuelSoap.prototype.retrieve('Test', sampleSecondArg, function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Properties, sampleSecondArg);
			});

			// this next part doesn't make sense, so bear with me. this seems to be a bug
			// that has never been realized
			it('should set default props if second arg is an object', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', {}, function() {});

				// Assert
				assert.deepEqual(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Properties, ['Client', 'ID', 'ObjectID']);
			});

			// can you see the not making sense part now?
			it('should set ClientIDs to clientIds on second arg in body if second arg is an object (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Arrange
				var sampleCallback = function() {};
				sampleCallback.clientIDs = [1,2,3,4];

				// Act
				FuelSoap.prototype.retrieve('Test', {}, sampleCallback);

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.ClientIDs, sampleCallback.clientIDs);
			});

			it('should set ClientIDs to clientIds on second arg in body if second arg is an object (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Arrange
				var sampleCallback = function() {};
				sampleCallback.filter = { filter: 'yes i am' };

				// Act
				FuelSoap.prototype.retrieve('Test', {}, sampleCallback);

				// Assert
				assert.deepEqual(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Filter, sampleCallback.filter);
			});
		});

		describe('argument 3 (0 based index)', function() {
			var sampleProps;
			var sampleOptions;

			beforeEach(function() {
				sampleProps = { props: true };
				sampleOptions = {
					clientIDs: [1,2,3,4],
					filter: { filter: 'yes i am' }
				};
				sinon.stub(FuelSoap.prototype, '_parseFilter', function(filter) { return filter; });
			});

			afterEach(function() {
				FuelSoap.prototype._parseFilter.restore();
			});

			it('should set passed props', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', sampleProps, sampleOptions, function() {});

				// Assert
				assert.deepEqual(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Properties, sampleProps);
			});

			it('should set ClientIDs to options.clientIDs in body (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', sampleProps, sampleOptions, function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.ClientIDs, sampleOptions.clientIDs);
			});

			it('should set Filter to options.filter in body (RetrieveRequestMsg > RetrieveRequest)', function() {
				// Act
				FuelSoap.prototype.retrieve('Test', sampleProps, sampleOptions, function() {});

				// Assert
				assert.equal(soapRequestSpy.args[0][0].req.RetrieveRequestMsg.RetrieveRequest.Filter, sampleOptions.filter);
			});
		});
	});


	describe('callback placement - callback execution', function() {
		it('should pass callback to soapRequest when passed as last param', function() {
			var sampleCallback = sinon.spy();

			// Act
			FuelSoap.prototype.retrieve('Test', { props: true }, { options: true }, sampleCallback);

			// Assert
			assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
		});

		it('should pass callback to soapRequest when passed in place of options', function() {
			var sampleCallback = sinon.spy();

			// Act
			FuelSoap.prototype.retrieve('Test', { props: true }, sampleCallback);

			// Assert
			assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
		});

		it('should pass callback to soapRequest when passed in place of propr', function() {
			var sampleCallback = sinon.spy();

			// Act
			FuelSoap.prototype.retrieve('Test', sampleCallback);

			// Assert
			assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
		});
	});
});
