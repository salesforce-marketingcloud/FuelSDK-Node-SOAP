var expect   = require( 'chai' ).expect;
var FuelSoap = require( '../../lib/fuel-soap' );
var FuelAuth = require( 'fuel-auth' );

describe( 'General Tests', function() {
	'use strict';

	it( 'should be a constructor', function() {
		expect( FuelSoap ).to.be.a( 'function' );
	});

	it( 'should require auth options', function() {
		var SoapClient;

		try {
            SoapClient = new FuelSoap();
        } catch ( err ) {
            expect( err.message).to.equal( 'options are required. see readme.' );
        }

        SoapClient = new FuelSoap({
			clientId: 'testing'
			, clientSecret: 'testing'
		});

		// rest client should have an instance of an auth client
		expect( SoapClient.AuthClient instanceof FuelAuth ).to.be.true;
	});

    it( 'should use already initiated fuel auth client', function() {
        var AuthClient, SoapClient;

        AuthClient = new FuelAuth({
            clientId: 'testing'
            , clientSecret: 'testing'
        });

        AuthClient.test = true;

        SoapClient = new FuelSoap( AuthClient );

        expect( SoapClient.AuthClient.test).to.be.true;
    });

	it( 'should take a custom soap endpoint', function() {
		// testing default initialization
		var SoapClient = new FuelSoap({
			clientId: 'testing'
			, clientSecret: 'testing'
		});

		expect( SoapClient.requestOptions.uri ).to.equal( 'https://webservice.exacttarget.com/Service.asmx' );

		// testing custom endpoint
		SoapClient = new FuelSoap({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, 'https://www.exacttarget.com' );

		expect( SoapClient.requestOptions.uri ).to.equal( 'https://www.exacttarget.com' );
	});

	it( 'should have makeRequest on prototype', function() {
		expect( FuelSoap.prototype.makeRequest ).to.be.a( 'function' );
	});

	it( 'should have create on prototype', function() {
		expect( FuelSoap.prototype.create ).to.be.a( 'function' );
	});

	it( 'should have retrieve on prototype', function() {
		expect( FuelSoap.prototype.retrieve ).to.be.a( 'function' );
	});

	it( 'should have update on prototype', function() {
		expect( FuelSoap.prototype.update ).to.be.a( 'function' );
	});

	it( 'should have delete on prototype', function() {
		expect( FuelSoap.prototype.delete ).to.be.a( 'function' );
	});

    it( 'should have describe on prototype', function() {
        expect( FuelSoap.prototype.describe ).to.be.a( 'function' );
    });

    it( 'should have execute on prototype', function() {
        expect( FuelSoap.prototype.execute ).to.be.a( 'function' );
    });

    it( 'should have perform on prototype', function() {
        expect( FuelSoap.prototype.perform ).to.be.a( 'function' );
    });

    it( 'should have configure on prototype', function() {
        expect( FuelSoap.prototype.configure ).to.be.a( 'function' );
    });

    it( 'should have schedule on prototype', function() {
        expect( FuelSoap.prototype.schedule ).to.be.a( 'function' );
    });

    it( 'should have versionInfo on prototype', function() {
        expect( FuelSoap.prototype.versionInfo ).to.be.a( 'function' );
    });

    it( 'should have extract on prototype', function() {
        expect( FuelSoap.prototype.extract ).to.be.a( 'function' );
    });

    it( 'should have getSystemStatus on prototype', function() {
        expect( FuelSoap.prototype.getSystemStatus ).to.be.a( 'function' );
    });

    it( 'should have buildEnvelope on prototype', function() {
        expect( FuelSoap.prototype.buildEnvelope ).to.be.a( 'function' );
    });

	it( 'should have handleRequest on prototype', function() {
		expect( FuelSoap.prototype.handleRequest ).to.be.a( 'function' );
	});
});
