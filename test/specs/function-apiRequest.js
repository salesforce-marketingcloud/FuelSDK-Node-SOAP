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

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
var mockServer = require( '../mock-server' );
var FuelRest   = require( '../../lib/fuel-rest' );
var FuelAuth   = require( 'fuel-auth' );
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port;

describe( 'apiRequest method', function() {
	'use strict';

	var server, RestClient;

	before( function() {
		// setting up rest client for all tests to use
		RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, localhost );

		// faking auth
		RestClient.AuthClient.accessToken = 'testForRest';
		RestClient.AuthClient.expiration  = 111111111111;

		// setting up server
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	it( 'should make a requset to the API', function( done ) {
		RestClient.apiRequest( 'get', '/get/test', null, function( err, data ) {
			// making sure original request was GET
			expect( data.res.req.method ).to.equal( 'GET' );

			// finish async test
			done();
		});
	});

	it( 'should add extra headers to default headers', function( done ) {
		var localOptions = {
			requestOptions: {
				headers: {
					'X-Test-Header': 'testing value'
				}
			}
		};

		RestClient.apiRequest( 'get', '/get/test', localOptions, function( err, data ) {
			// making sure custom header was sent in request
			expect( data.res.req._headers['x-test-header'] ).to.equal( localOptions.requestOptions.headers[ 'X-Test-Header' ] );

			// finish async test
			done();
		});
	});

	it( 'should add extra options to request module - testing qs', function( done ) {
		var localOptions = {
			requestOptions: {
				qs: {
					'test': 1
				}
			}
		};

		RestClient.apiRequest( 'get', '/get/test', localOptions, function( err, data ) {
			// checking to make sure path on request was correct
			expect( data.res.req.path ).to.equal( '/get/test?test=1' );

			// finish async test
			done();
		});
	});

	it( 'should override Authorization header if passed', function( done ) {
		var localOptions = {
			requestOptions: {
				headers: {
					Authorization: 'Bearer diffTestForRest'
				}
			}
		};

		RestClient.apiRequest( 'get', '/get/test', localOptions, function( err, data ) {
			// making sure different auth header was sent in request
			expect( data.res.req._headers.authorization ).to.equal( localOptions.requestOptions.headers.Authorization );

			// finish async test
			done();
		});
	});

	it( 'should return an error when application type returned is not application/json', function( done ) {
		RestClient.apiRequest( 'get', '/not/json/response', null, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.message ).to.equal( 'API did not return JSON' );
			expect( data ).to.be.null;

			// finish async test
			done();
		});
	});

	it( 'should error when request module errors', function( done ) {
		RestClient.apiRequest( 'TEST', '/not/json/response', null, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'Request Module inside apiRequest' );
			expect( data ).to.be.null;

			// finish async test
			done();
		});
	});

	it( 'should return an error when no accessToken is available', function( done ) {
		// stubbing response from auth client with no access token
		sinon.stub( FuelAuth.prototype, 'getAccessToken', function( requestOptions, force, callback ) {
			this._deliverResponse( 'response', {
				documentation: "https://code.docs.exacttarget.com/rest/errors/404"
				, errorcode: 404
				, message: "Not Found"
			}, callback );
		});

		// creating local rest client so we can use stubbed auth function
		var RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, localhost );

		RestClient.apiRequest( 'get', '/get/test', null, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'FuelAuth' );
			expect( err.message ).to.equal( 'No access token' );
			expect( err.res ).to.be.a( 'object' );
			expect( data ).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype.getAccessToken.restore();

			// finish async test
			done();
		});
	});

	it( 'should handle an error from the Auth Client', function( done ) {
		// stubbing response from auth client with no access token
		sinon.stub( FuelAuth.prototype, '_requestToken', function( requestOptions, callback ) {
			this._deliverResponse( 'error', new Error( 'error from auth client' ), callback );
		});

		// creating local rest client so we can use stubbed auth function
		var RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, localhost );

		RestClient.apiRequest( 'get', '/get/test', null, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'FuelAuth' );
			expect( err.message ).to.equal( 'error from auth client' );
			expect( data ).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype._requestToken.restore();

			// finish async test
			done();
		});
	});

	it( 'should use event emitter for response when no callback passed', function( done ) {
		RestClient.on( 'response', function( data ) {
			// making sure original request was GET
			expect( data.res.req.method ).to.equal( 'GET' );

			// finish async test
			done();
		});

		RestClient.apiRequest( 'get', '/get/test', null );
	});

	it( 'should use event emitter for error when no callback passed', function( done ) {
		// stubbing response from auth client with no access token
		sinon.stub( FuelAuth.prototype, '_requestToken', function( requestOptions, callback ) {
			this._deliverResponse( 'error', new Error( 'error from auth client' ), callback );
		});

		// creating local rest client so we can use stubbed auth function
		var RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, localhost );

		RestClient.on( 'error', function( err ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'FuelAuth' );
			expect( err.message ).to.equal( 'error from auth client' );

			// restoring stubbed function
			FuelAuth.prototype._requestToken.restore();

			// finish async test
			done();
		});

		RestClient.apiRequest( 'get', '/get/test', null );
	});
});
