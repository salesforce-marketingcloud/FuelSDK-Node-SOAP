var version = require( '../package.json').version;
var request = require( 'request');
var _       = require( 'lodash' );

module.exports   = FuelNodeRest;

function FuelNodeRest( auth, uri, options, callback ) {

	var defaults = {
		method: 'GET',
		headers: {
			'User-Agent' : 'node-fuel/' + auth.version
		},
		json : true
	};

	options = _.merge( {}, defaults, options );

	options.uri    = uri;
	options.method = options.method;
	options.json   = options.json;

	if( options.body ) {
		// why does this need to be here? if there's an option.body it should not need to be reassigned
		options.body = options.body;
	}

	if( !auth.accessToken || !auth._checkExpired() ) {

		// make the request after getting new token
		auth.getAccessToken( function( err, res, body ) {

			if( err ) {
				callback( err );
				return;
			}

			options.headers.Authorization = 'Bearer ' + auth.accessToken;

			_makeRequest( options, callback );
		});
	}
	else {
		options.headers.Authorization = 'Bearer ' + auth.accessToken;

		_makeRequest( options, callback );
	}
}

function _makeRequest(options, callback){
	request(options, function (error,response,body){
		if (error) {
			callback(error);
		} else {
			callback(error,response,body);
		}
	})
}

FuelNodeRest.version = version;