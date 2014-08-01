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
