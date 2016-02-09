/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var expect     = require('chai').expect;
var mockServer = require('../mock-server');
var FuelSoap   = require('../../lib/fuel-soap');
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port + '/sample/soap/endpoint';

describe( 'soapRequest method', function() {
	var server, SoapClient;

	before( function() {
		// setting up soap client for all tests to use
		var options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, soapEndpoint: localhost
		};

		SoapClient = new FuelSoap( options );

		// faking auth
		SoapClient.AuthClient.accessToken = 'testForSoap';
		SoapClient.AuthClient.expiration = 111111111111;

		// setting up server
		server = mockServer( port );
	});

	after( function() {
		server.close();
	});

	it( 'should throw an error when no options are passed', function() {
		try {
			SoapClient.soapRequest(null, function () {});
		} catch ( err ) {
			expect( err.name).to.equal( 'TypeError' );
			expect( err.message).to.equal( 'options argument is required' );
		}
	});

	it( 'should throw an error if no callback is present', function() {
		try {
			SoapClient.soapRequest( null, null );
		} catch( err ) {
			expect( err.name ).to.equal( 'TypeError' );
			expect( err.message ).to.equal( 'callback argument is required' );
		}
	});

	it( 'should execute a describe call', function() {
		var body = {
			DefinitionRequestMsg: {
				'$': {
					'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
				},
				'DescribeRequests': {
					'ObjectDefinitionRequest': {
						'ObjectType': 'Email' // Come back to
					}
				}
			}
		};

		SoapClient.soapRequest({
			action: 'Describe',
			req: body,
			key: 'DefinitionResponseMsg',
			retry: false
		}, function(err, data) {
			expect(err).to.not.exist;
			expect( data.res.req.method).to.equal( 'POST' );
			expect( data.res.req._headers.soapaction.toLowerCase() ).to.equal( 'describe' );
		});
	});
});
