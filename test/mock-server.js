/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

var http = require('http');
var bodyParser = require('body-parser');

var validUrls = {
	base: '/sample/soap/endpoint'
};
var sampleResponses = require('./sample-responses');

module.exports = function(port) {
	'use strict';

	return http.createServer(function(req, res) {

		var _bodyParser   = bodyParser.json();
		var validUrlCheck = false;

		res.setHeader('Content-Type', 'text/xml');

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
			res.end();
			return;
		}

		_bodyParser(req, res, function(err) {
			var soapAction = req.headers.soapaction;

			if (err) {
				throw new Error('problem with bodyParser');
			}

			if (req.method !== 'POST') {
				res.statusCode = 500;
				res.end();
				return;
			}

			if( soapAction.toLowerCase() === 'describe' ) {
				res.statusCode = 200;
				res.end(sampleResponses.describe);
				return;
			}

			if( soapAction.toLowerCase() === 'retrieve' ) {
				res.statusCode = 200;
				res.end(sampleResponses.retrieve);
				return;
			}

			if( soapAction.toLowerCase() === 'create' ) {
				res.statusCode = 200;
				res.end(sampleResponses.create);
				return;
			}

			if( soapAction.toLowerCase() === 'update' ) {
				res.statusCode = 200;
				res.end(sampleResponses.update);
				return;
			}

			if( soapAction.toLowerCase() === 'delete' ) {
				res.statusCode = 200;
				res.end(sampleResponses.delete);
				return;
			}

			if( soapAction.toLowerCase() === 'execute' ) {
				res.statusCode = 200;
				res.end(sampleResponses.execute);
				return;
			}

			// coverall
			res.statusCode = 500;
			res.end();
			return;
		});
	}).listen(port);
};
