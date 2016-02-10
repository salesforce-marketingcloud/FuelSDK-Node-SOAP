/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
var mockServer = require( '../mock-server' );
var FuelSoap   = require( '../../lib/fuel-soap' );
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port + '/sample/soap/endpoint';

describe( 'SOAP methods', function() {
	var server;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	describe( 'SOAP Action Describe', function () {
		it( 'should deliver a describe + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.describe( 'Email', function( err, data ) {
				// need to make sure we called soapRequest method
				expect( soapRequestSpy.calledOnce ).to.be.true;

				// making sure original request was describe
				expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'describe' );

				FuelSoap.prototype.soapRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe( 'SOAP Action retrieve', function () {
		it( 'should deliver a retrieve + response with option clientIDs', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

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
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was retrieve
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'retrieve' );

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it( 'should deliver a retrieve + response without option clientIDs', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

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
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was retrieve
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'retrieve' );

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
				expect(options.req.RetrieveRequestMsg.RetrieveRequest.QueryAllAccounts).to.equal(true);
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
				expect(options.req.RetrieveRequestMsg.RetrieveRequest.QueryAllAccounts).to.be.undefined;
				client.soapRequest.restore();
				done();
			});

			// Act
			client.retrieve('Email', ['ID'], soapRequestOptions, function(){});
		});
	});

	describe( 'SOAP Action create', function () {
		it( 'should deliver a create + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.create(
				'Email',
				{
					Name: 'SOAP Test Email',
					Subject: 'SOAP Test Email'
				},
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was create
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'create' );

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});

		it('should add QueryAllAccounts to body -> CreateRequest -> Options', function(done) {
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
				expect(options.req.CreateRequest.Options.QueryAllAccounts).to.equal(true);
				client.soapRequest.restore();
				done();
			});

			// Act
			client.create('Email', { ID: 12345 }, soapRequestOptions, function(){});
		});

		it('should not add QueryAllAccounts to body -> CreateRequest -> Options', function(done) {
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
				expect(options.req.CreateRequest.Options).to.equal.null;
				client.soapRequest.restore();
				done();
			});

			// Act
			client.create('Email', { ID: 12345 }, function(){});
		});
	});

	describe( 'SOAP Action update', function () {
		it( 'should deliver a update + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.update(
				'Email',
				{
					ID: 514,
					Subject: 'Updated Subject'
				},
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was update
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'update' );

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
				expect(options.req.UpdateRequest.Options.QueryAllAccounts).to.equal(true);
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
				expect(options.req.UpdateRequest.Options).to.be.null;
				client.soapRequest.restore();
				done();
			});

			// Act
			client.update('Email', { ID: 12345 }, function(){});
		});
	});

	describe( 'delete', function () {
		it( 'should deliver a delete + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.delete( 'Email',
				{
					ID: 514
				},
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was delete
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'delete' );

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});
	});

	describe( 'execute', function() {
		it( 'should deliver an execute + response', function(done) {
			// setting up spy and soap client
			var soapRequestSpy = sinon.spy( FuelSoap.prototype, 'soapRequest' );

			// initialization options
			var options = {
				auth: {
					clientId: 'testing'
					, clientSecret: 'testing'
				}
				, soapEndpoint: localhost
			};
			var SoapClient = new FuelSoap( options );

			// faking auth
			SoapClient.AuthClient.accessToken = 'testForSoap';
			SoapClient.AuthClient.expiration  = 111111111111;

			SoapClient.execute( 'LogUnsubEvent',
				{
					ID: 514
				},
				function( err, data ) {
					// need to make sure we called soapRequest method
					expect( soapRequestSpy.calledOnce ).to.be.true;

					// making sure original request was delete
					expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'execute' );

					FuelSoap.prototype.soapRequest.restore(); // restoring function
					done();
				}
			);
		});
	});
});
