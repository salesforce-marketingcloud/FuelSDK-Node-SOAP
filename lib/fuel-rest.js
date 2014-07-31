var version      = require( '../package.json').version;
var request      = require( 'request');
var _            = require( 'lodash' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var url          = require( 'url' );
var FuelAuth     = require( 'fuel-auth' );


var FuelRest = function( authOptions, restEndpoint ) {
	'use strict';

	try {
		this.AuthClient = new FuelAuth( authOptions );
	} catch( err ) {
		console.log( err );
		return;
	}

	// adding version to object
	this.version = version;

	// setting up default headers
	this.defaultHeaders = {
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'application/json'
	};

	// configuring rest options
	this.requestOptions     = {};
	this.requestOptions.uri = restEndpoint || 'https://www.exacttargetapis.com';
};

// adding inheriting properties from EventEmitter
util.inherits( FuelRest, EventEmitter );

FuelRest.prototype.apiRequest = function( type, uri, options, callback ) {
	'use strict';

	var requestOptions = options && options.requestOptions || {};
	var authOptions    = options && options.authOptions || {};

	// setting up request options
	requestOptions         = _.merge( {}, this.requestOptions, requestOptions );
	requestOptions.uri     = url.resolve( requestOptions.uri, uri ); // resolving url to be used for request
	requestOptions.method  = type;
	requestOptions.headers = _.merge( {}, this.defaultHeaders, requestOptions.headers );

	// setting up authOptions
	authOptions.forceRequest   = authOptions.forceRequest || null;
	authOptions.requestOptions = authOptions.requestOptions || null;

	this.AuthClient.once( 'response', function( body ) {
		var localError;

		// if there's no access token we have a problem
		if( !body.accessToken ) {
			localError     = new Error( 'No access token' );
			localError.res = body;
			this._deliverResponse( 'error', localError, callback, 'FuelAuth' );
			return;
		}

		// adding the bearer token
		requestOptions.headers.Authorization = requestOptions.headers.Authorization || 'Bearer ' + body.accessToken;

		// send request to api
		request( requestOptions, function( err, res, body ) {
			var parsedBody;

			if( err ) {
				this._deliverResponse( 'error', err, callback, 'Request Module inside apiRequest' );
				return;
			}

			// checking to make sure it's json from api
			if( res.headers[ 'content-type' ].split( ';' )[ 0 ].toLowerCase() !== 'application/json' ) {
				this._deliverResponse( 'error', new Error('API did not return JSON'), callback, 'Fuel REST' );
				return;
			}

			// trying to parse body
			try {
				parsedBody = JSON.parse( body );
			} catch( err ) {
				parsedBody = body;
			}

			this._deliverResponse( 'response', { res: res, body: parsedBody }, callback );

		}.bind( this ) );
	}.bind( this ) );

	this.AuthClient.once( 'error', function( err ) {
		this._deliverResponse( 'error', err, callback, 'FuelAuth' );
	}.bind( this ) );

	this.AuthClient.getAccessToken( authOptions.requestOptions, authOptions.forceRequest );
};

FuelRest.prototype.get = function( uri, options, callback ) {
	'use strict';

	this.apiRequest( 'GET', uri, options, callback );
};

FuelRest.prototype.post = function( uri, data, options, callback ) {
	'use strict';

	options = this._mergePostData( data, options );

	this.apiRequest( 'POST', uri, options, callback );
};

FuelRest.prototype.put = function( uri, data, options, callback ) {
	'use strict';

	options = this._mergePostData( data, options );

	this.apiRequest( 'PUT', uri, options, callback );
};

FuelRest.prototype.delete = function( uri, data, options, callback ) {
	'use strict';

	options = this._mergePostData( data, options );

	this.apiRequest( 'DELETE', uri, options, callback );
};


FuelRest.prototype._deliverResponse = function( type, data, callback, errorFrom ) {
	'use strict';

	// if it's an error and we have where it occured, let's tack it on
	if( type === 'error' && !!errorFrom ) {
		data.errorPropagatedFrom = errorFrom;
	}

	if( _.isFunction( callback ) ) {
		if( type === 'error' ) {
			callback( data, null );
		} else if( type === 'response' ) {
			callback( null, data );
		}
		return;
	}

	this.emit( type, data );
};

FuelRest.prototype._mergePostData = function( data, options ) {
	'use strict';

	if( !!data ) {
		options = options || {};
		options.requestOptions = options.requestOptions || {};
		options.requestOptions.json = _.merge( {}, options.requestOptions.json || {}, data );
	}

	return data;
};

module.exports = FuelRest;
