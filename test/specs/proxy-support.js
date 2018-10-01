/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
const assert = require('assert');
const FuelSoap = require('../../lib/fuel-soap');
const http = require('http');

const proxyPort = 8888;
const proxyMessage = 'Test soap message';
const proxyResponseEnvelope = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><soap:Body><CreateResponse xmlns="http://exacttarget.com/wsdl/partnerAPI"><Message>${proxyMessage}</Message></CreateResponse></soap:Body></soap:Envelope>`;
const server = http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.write(proxyResponseEnvelope);
    response.end();
});

describe('Proxy support', function () {

    let soapClient, initOptions;

    before(done => server.listen(proxyPort, done));

    beforeEach(() => {
        initOptions = {
            auth: {
                clientId: 'testing',
                clientSecret: 'testing'
            },
            soapEndpoint: 'http://test.com',
            proxy: {
                host: '127.0.0.1',
                protocol: 'http:'
            }
        };
    });

    it('should respond the proxyResponseEnvelope if proxy option passed correctly', done => {
        initOptions.proxy.port = proxyPort;
        soapClient = new FuelSoap(initOptions);
        soapClient.AuthClient.accessToken = 'accessToken';
        soapClient.AuthClient.expiration = 'expiration';
        soapClient.create('Email', {}, {}, function (err, response) {
            assert.equal(response.body.Message, proxyMessage);
            done();
        });
    });

    it('should error if proxy option passed incorrectly', done => {
        initOptions.proxy.port = 1234;
        soapClient = new FuelSoap(initOptions);
        soapClient.AuthClient.accessToken = 'accessToken';
        soapClient.AuthClient.expiration = 'expiration';
        soapClient.retrieve({}, {}, {}, (err) => {
            assert.equal(err.code, 'ECONNREFUSED');
            done();
        });
    });

    after(() => server.close());

});
