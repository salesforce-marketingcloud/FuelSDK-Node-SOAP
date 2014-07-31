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
