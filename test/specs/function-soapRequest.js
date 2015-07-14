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
	
	it( 'should pass a custom header if present', function() {
		var key = 'customheaderkey';
		var val = 'customHeaderVal';
		var reqOptions = {headers:{}};
		reqOptions.headers[key] = val;
		var body = {
			'RetrieveRequestMsg': {
				'$': {
					'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
				},
				'RetrieveRequest': {
					'ObjectType': 'Email',
					'Properties': ['ID','Name']
				}
			}
		};

		SoapClient.soapRequest({
			action: 'Retrieve',
			req: body,
			key: 'RetrieveResponseMsg',
			retry: true,
			reqOptions: reqOptions
		}, function(err, data) {
			expect(err).to.not.exist;  
			expect(data)
				.to.have.deep.property('res.req._headers.'+key, val);
		});
		
		var key2 = 'customheaderkey2';
		var val2 = 'customHeaderVal2';
		var reqOptions2 = {headers:{}};
		reqOptions2.headers[key2] = val2;		

		SoapClient.soapRequest({
			action: 'Retrieve',
			req: body,
			key: 'RetrieveResponseMsg',
			retry: true,
			reqOptions: reqOptions2
		}, function(err, data) {
			expect(err).to.not.exist;  
			expect(data)
				.to.have.deep.property('res.req._headers.'+key2, val2);
			expect(data)
				.to.not.have.deep.property('res.req._headers.'+key);				
		});
	});	
});
