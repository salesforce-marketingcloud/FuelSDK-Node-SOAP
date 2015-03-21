/**
* Copyright (c) 2014​, salesforce.com, inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted provided
* that the following conditions are met:
*
*    Redistributions of source code must retain the above copyright notice, this list of conditions and the
*    following disclaimer.
*
*    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
*    the following disclaimer in the documentation and/or other materials provided with the distribution.
*
*    Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
*    promote products derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
* WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
* PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
* TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
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

	describe( 'describe', function () {
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

	describe( 'retrieve', function () {
		it( 'should deliver a retrieve + response', function(done) {
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
	});
	
	describe( 'retrieve', function () {
		it( 'should deliver a retrieve + response', function(done) {
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
	});

	describe( 'create', function () {
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
	});

	describe( 'update', function () {
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
});
