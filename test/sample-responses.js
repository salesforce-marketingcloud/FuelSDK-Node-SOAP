/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var fs = require('fs');

var readFileSync = function ( path ) {
	var filename = require.resolve( path );
	return fs.readFileSync( filename, 'utf8' );
};

var describeRepsonse = readFileSync( './sample-xml/describe-response.xml' );
var retrieveResponse = readFileSync( './sample-xml/retrieve-response.xml' );
var createResponse   = readFileSync( './sample-xml/create-response.xml' );
var updateResponse   = readFileSync( './sample-xml/update-response.xml' );
var deleteResponse   = readFileSync( './sample-xml/delete-response.xml' );
var executeResponse   = readFileSync( './sample-xml/execute-response.xml' );

module.exports = {
	describe: describeRepsonse
	, retrieve: retrieveResponse
	, create: createResponse
	, update: updateResponse
	, delete: deleteResponse
    , execute: executeResponse
};
