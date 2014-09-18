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

var expect          = require( 'chai' ).expect;
var sinon           = require( 'sinon' );
var mockServer      = require( '../mock-server' );
var FuelRest        = require( '../../lib/fuel-rest' );
var port            = 4550;
var localhost       = 'http://127.0.0.1:' + port;

describe( 'HTTP methods', function() {
	'use strict';

	var server;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	describe( 'GET', function() {
		it( 'should deliver a GET + response', function(done) {
			// setting up spy and rest client
			var apiRequestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );
			var RestClient    = new FuelRest({
				clientId: 'testing'
				, clientSecret: 'testing'
			}, localhost );

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			RestClient.get( '/get/test', null, function( err, data ) {
				// need to make sure we called apiRequest method
				expect( apiRequestSpy.calledOnce ).to.be.true;

				// making sure original request was GET
				expect( data.res.req.method ).to.equal( 'GET' );

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe( 'POST', function() {
		it( 'should deliver a POST', function( done ) {
			// request spy
			var apiRequestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );

			// post data, will only return response if this is correct
			var postData = {
				testingData: 'test data'
			};

			// rest client setup
			var RestClient = new FuelRest({
				clientId: 'testing'
				, clientSecret: 'testing'
			}, localhost );

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.post( '/post/test', postData, null, function( err, data ) {
				// need to make sure we called apiRequest method
				expect( apiRequestSpy.calledOnce ).to.be.true;

				// making sure original request was POST
				expect( data.res.req.method ).to.equal( 'POST' );

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});

		});
	});

	describe( 'PUT', function() {
		it( 'should deliever an PUT/UPDATE', function( done ) {
			// request spy
			var apiRequestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );

			// post data, will only return response if this is correct
			var postData = {
				testingData: 'test data'
			};

			// rest client setup
			var RestClient = new FuelRest({
				clientId: 'testing'
				, clientSecret: 'testing'
			}, localhost );

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.put( '/post/update', postData, null, function( err, data ) {
				// need to make sure we called apiRequest method
				expect( apiRequestSpy.calledOnce ).to.be.true;

				// making sure original request was POST
				expect( data.res.req.method ).to.equal( 'PUT' );

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe( 'DELETE', function() {
		it( 'should deliever an DELETE', function( done ) {
			// request spy
			var apiRequestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );

			// post data, will only return response if this is correct
			var postData = {
				testingData: 'test data'
			};

			// rest client setup
			var RestClient = new FuelRest({
				clientId: 'testing'
				, clientSecret: 'testing'
			}, localhost );

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.delete( '/post/delete', postData, null, function( err, data ) {
				// need to make sure we called apiRequest method
				expect( apiRequestSpy.calledOnce ).to.be.true;

				// making sure original request was POST
				expect( data.res.req.method ).to.equal( 'DELETE' );

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

});
