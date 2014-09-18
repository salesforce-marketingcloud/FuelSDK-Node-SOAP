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
        var options = {
            auth: {
                clientId: 'testing'
                , clientSecret: 'testing'
            }
        };

		try {
            SoapClient = new FuelSoap();
        } catch ( err ) {
            expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
        }

        SoapClient = new FuelSoap( options );

		// rest client should have an instance of an auth client
		expect( SoapClient.AuthClient instanceof FuelAuth ).to.be.true;
	});

    it( 'should use already initiated fuel auth client', function() {
        var AuthClient, SoapClient;
        var authOptions = {
            clientId: 'testing'
            , clientSecret: 'testing'
        };

        AuthClient = new FuelAuth( authOptions );

        AuthClient.test = true;

        SoapClient = new FuelSoap({ auth: AuthClient });

        expect( SoapClient.AuthClient.test).to.be.true;
    });

	it( 'should take a custom soap endpoint', function() {
        var options = {
            auth: {
                clientId: 'testing'
                , clientSecret: 'testing'
            }
        };

		// testing default initialization
		var SoapClient = new FuelSoap( options );

		expect( SoapClient.requestOptions.uri ).to.equal( 'https://webservice.exacttarget.com/Service.asmx' );

        options.origin = 'https://www.exacttarget.com';

		// testing custom endpoint
		SoapClient = new FuelSoap( options );

		expect( SoapClient.requestOptions.uri ).to.equal( 'https://www.exacttarget.com' );
	});

	it( 'should have soapRequest on prototype', function() {
		expect( FuelSoap.prototype.soapRequest() ).to.be.a( 'function' );
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

    it( 'should have _buildEnvelope on prototype', function() {
        expect( FuelSoap.prototype._buildEnvelope ).to.be.a( 'function' );
    });

	it( 'should have _parseResponse on prototype', function() {
		expect( FuelSoap.prototype._parseResponse ).to.be.a( 'function' );
	});
});
