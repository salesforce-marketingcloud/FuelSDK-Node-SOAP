var expect   = require( 'chai' ).expect;
var FuelRest = require( '../../lib/fuel-rest' );
var FuelAuth = require( 'fuel-auth' );

describe( 'General Tests', function() {
	'use strict';

	it( 'should be a constructor', function() {
		expect( FuelRest ).to.be.a( 'function' );
	});

	it( 'should require auth options', function() {
		var RestClient = new FuelRest();

		// if no options are passed, there will be no auth client
		expect( RestClient.AuthClient ).to.be.undefined;

		RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		});

		// rest client should have an instance of an auth client
		expect( RestClient.AuthClient instanceof FuelAuth ).to.be.true;
	});

	it( 'should take a custom rest endpoint', function() {
		// testing default initialization
		var RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		});

		expect( RestClient.requestOptions.uri ).to.equal( 'https://www.exacttargetapis.com' );

		// testing custom endpoint
		RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, 'https://www.exacttarget.com' );

		expect( RestClient.requestOptions.uri ).to.equal( 'https://www.exacttarget.com' );
	});

	it( 'should have event emitter prototype', function() {
		expect( FuelRest.super_.name ).to.equal( 'EventEmitter' );
	});

	it( 'should have apiRequest on prototype', function() {
		expect( FuelRest.prototype.apiRequest ).to.be.a( 'function' );
	});

	it( 'should have get on prototype', function() {
		expect( FuelRest.prototype.get ).to.be.a( 'function' );
	});

	it( 'should have post on prototype', function() {
		expect( FuelRest.prototype.post ).to.be.a( 'function' );
	});

	it( 'should have put on prototype', function() {
		expect( FuelRest.prototype.put ).to.be.a( 'function' );
	});

	it( 'should have delete on prototype', function() {
		expect( FuelRest.prototype.delete ).to.be.a( 'function' );
	});

	it( 'should have _deliverResponse on prototype', function() {
		expect( FuelRest.prototype._deliverResponse ).to.be.a( 'function' );
	});
});
