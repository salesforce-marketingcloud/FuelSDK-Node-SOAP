/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert     = require('assert');
var sinon      = require('sinon');
var mockServer = require('../mock-server');
var FuelSoap   = require('../../lib/fuel-soap');
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port + '/sample/soap/endpoint';

describe('SOAP methods', function() {
	var server;

	before(function() {
		server = mockServer(port);
	});

	after(function() {
		server.close();
	});

	describe('SOAP Action retrieve', function() {
		it('should deliver a retrieve + response with option clientIDs', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap(options);

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.retrieve(
				'Email',
				[
					"ID",
					"Client.ID",
					"Name",
					"CategoryID",
					"HTMLBody",
					"TextBody",
					"Subject",
					"IsActive",
					"IsHTMLPaste",
					"EmailType",
					"CharacterSet",
					"HasDynamicSubjectLine",
					"ContentCheckStatus",
					"ContentAreas",
					"CustomerKey",
					"CreatedDate",
					"ModifiedDate"
				],
				{
					filter: {
						leftOperand: 'Name',
						operator: 'equals',
						rightOperand: 'DS_TEST'
					},
					clientIDs: [{ID:6227021}]
				},
				function(err, data) {
					// need to make sure we called soapRequest method
					assert.ok(soapRequestSpy.calledOnce);

					// making sure original request was retrieve
					assert.equal(data.res.req._headers.soapaction.toLowerCase(), 'retrieve');

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it('should deliver a retrieve + response without option clientIDs', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap(options);

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.retrieve(
				'Email',
				[
					"ID",
					"Client.ID",
					"Name",
					"CategoryID",
					"HTMLBody",
					"TextBody",
					"Subject",
					"IsActive",
					"IsHTMLPaste",
					"EmailType",
					"CharacterSet",
					"HasDynamicSubjectLine",
					"ContentCheckStatus",
					"ContentAreas",
					"CustomerKey",
					"CreatedDate",
					"ModifiedDate"
				],
				{
					leftOperand: 'Name',
					operator: 'equals',
					rightOperand: 'DS_TEST'
				},
				function(err, data) {
					// need to make sure we called soapRequest method
					assert.ok(soapRequestSpy.calledOnce);

					// making sure original request was retrieve
					assert.equal(data.res.req._headers.soapaction.toLowerCase(), 'retrieve');

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it('should add QueryAllAccounts to body -> RetrieveRequestMsg -> RetrieveRequest', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);
			var soapRequestOptions = {
				leftOperand: 'Name'
				, operator: 'equals'
				, rightOperand: 'DS_TEST'
				, queryAllAccounts: true
			};

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.ok(options.req.RetrieveRequestMsg.RetrieveRequest.QueryAllAccounts);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.retrieve('Email', ['ID'], soapRequestOptions, function(){});
		});

		it('should not add QueryAllAccounts to body -> RetrieveRequestMsg -> RetrieveRequest', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);
			var soapRequestOptions = {
				leftOperand: 'Name'
				, operator: 'equals'
				, rightOperand: 'DS_TEST'
			};

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.equal(options.req.RetrieveRequestMsg.RetrieveRequest.QueryAllAccounts, undefined);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.retrieve('Email', ['ID'], soapRequestOptions, function(){});
		});
	});

	describe('SOAP Action update', function() {
		it('should deliver a update + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap(options);

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.update(
				'Email',
				{
					ID: 514,
					Subject: 'Updated Subject'
				},
				function(err, data) {
					// need to make sure we called soapRequest method
					assert.ok(soapRequestSpy.calledOnce);

					// making sure original request was update
					assert.equal(data.res.req._headers.soapaction.toLowerCase(), 'update');

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it('should add QueryAllAccounts to body -> UpdateRequest -> Options', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);
			var soapRequestOptions = { queryAllAccounts: true };

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.ok(options.req.UpdateRequest.Options.QueryAllAccounts);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.update('Email', { ID: 12345 }, soapRequestOptions, function(){});
		});

		it('should not add QueryAllAccounts to body -> UpdateRequest -> Options', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.equal(options.req.UpdateRequest.Options, null);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.update('Email', { ID: 12345 }, function(){});
		});
	});

	describe('SOAP Action delete', function() {
		it('should deliver a delete + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap(options);

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.delete('Email',
				{
					ID: 514
				},
				function(err, data) {
					// need to make sure we called soapRequest method
					assert.ok(soapRequestSpy.calledOnce);

					// making sure original request was delete
					assert.equal(data.res.req._headers.soapaction.toLowerCase(), 'delete');

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it('should add QueryAllAccounts to body -> DeleteRequest -> Options', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);
			var soapRequestOptions = { queryAllAccounts: true };

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.ok(options.req.DeleteRequest.Options.QueryAllAccounts);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.delete('Email', { ID: 12345 }, soapRequestOptions, function(){});
		});

		it('should not add QueryAllAccounts to body -> DeleteRequest -> Options', function(done) {
			// Arrange
			var initOptions = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var client = new FuelSoap(initOptions);

			sinon.stub(client, "soapRequest", function(options) {
				// Assert
				assert.equal(options.req.DeleteRequest.Options, null);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.delete('Email', { ID: 12345 }, function(){});
		});
	});

	describe('execute', function() {
		it('should deliver an execute + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy(FuelSoap.prototype, 'soapRequest');

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap(options);

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.execute('LogUnsubEvent',
				{
					ID: 514
				},
				function(err, data) {
					// need to make sure we called soapRequest method
					assert.ok(soapRequestSpy.calledOnce);

					// making sure original request was delete
					assert.equal(data.res.req._headers.soapaction.toLowerCase(), 'execute');

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});
	});
});
