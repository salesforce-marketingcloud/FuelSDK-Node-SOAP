/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var expect     = require('chai').expect;
var mockserver = require('../mock-server');
var FuelSoap   = require('../../lib/fuel-soap');
var port       = 4551;
var localhost  = 'http://127.0.0.1:' + port + '/sample/soap/endpoint';

describe('soapRequest custom headers', function() {
	var server, SoapClient;

	before(function() {
		// setting up soap client for all tests to use
		var options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, soapEndpoint: localhost
		};

		SoapClient = new FuelSoap(options);

		// faking auth
		SoapClient.AuthClient.accessToken = 'testForSoap';
		SoapClient.AuthClient.expiration = 111111111111;

		// setting up server
		server = mockserver(port);
	});

	after(function() {
		server.close();
	});

	it('should pass a custom header if present', function() {
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
