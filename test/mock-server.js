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

var http = require('http');
var bodyParser = require('body-parser');

var validUrls = {
	get: '/get/test'
	, post: '/post/test'
	, put: '/update/test'
	, delete: '/delete/test'
	, queryGet: '/get/test?test=1'
	, notJson: '/not/json/response'
};
var sampleResponses = require('./sample-responses');

module.exports = function(port) {
	'use strict';

	return http.createServer(function(req, res) {

		var _bodyParser   = bodyParser.json();
		var validUrlCheck = false;

		res.setHeader('Content-Type', 'application/json');

		// check for valid URL (404)
		for( var key in validUrls ) {
			if( validUrls.hasOwnProperty( key ) ) {
				if( validUrls[ key ] === req.url ) {
					validUrlCheck = true;
				}
			}
		}

		if( !validUrlCheck ) {
			res.statusCode = 404;
			res.end(JSON.stringify(sampleResponses['404']));
			return;
		}

		_bodyParser(req, res, function(err) {

			if (err) {
				throw new Error('problem with bodyParser');
			}

			if( req.url === validUrls.get && req.method === 'GET' ) {
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.get200 ) );
				return;
			}

			if( req.url === validUrls.post && req.body.testingData === 'test data' && req.method === 'POST' ) {
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.post200 ) );
				return;
			}

			if( req.url === validUrls.put && req.body.testingData === 'test data' && req.method === 'PUT' ) {
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.post200 ) );
				return;
			}

			if( req.url === validUrls.delete && req.body.testingData === 'test data' && req.method === 'DELETE' ) {
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.post200 ) );
				return;
			}

			if( req.url === validUrls.notJson ) {
				res.setHeader( 'Content-Type', 'text/html' );
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.get200 ) );
				return;
			}

			// coverall
			res.statusCode = 500;
			res.end(JSON.stringify(sampleResponses['500']));
			return;
		});
	}).listen(port);
};
