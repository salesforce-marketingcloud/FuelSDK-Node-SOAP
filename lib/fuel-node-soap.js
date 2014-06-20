var version = require( '../package.json').version;
var request = require( 'request');
var _       = require( 'lodash' );

module.exports   = FuelNodeSOAP;


function FuelNodeSOAP( auth, uri, options, callback ) {

	var defaults = {
		headers: {
			'User-Agent' : 'node-fuel/' + auth.version
		}
	};

	options = _.merge( {}, defaults, options );

	options.uri                     = uri;
	options.method                  = 'POST';
	options.headers.SOAPAction      = options.headers.SOAPAction;
	options.headers['Content-Type'] = 'text/xml';

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
			options.body = _createEnvelope( auth.accessToken, options.body );
			_makeRequest( options, callback );
		});
	}
	else {
		options.body = _createEnvelope( auth.accessToken, options.body );
		_makeRequest( options, callback );
	}
}

FuelNodeSOAP.describe = function (auth, uri, options, callback){
	if (!options.headers) {
		options.headers = {};
		options.headers.SOAPAction = "Describe";
	}
	
	FuelNodeSOAP(auth,uri,options,callback);
};

FuelNodeSOAP.create = function (auth, uri, options, callback){
	if (!options.headers) {
		options.headers = {};
		options.headers.SOAPAction = "Create";
	}
	
	FuelNodeSOAP(auth,uri,options,callback);
};

FuelNodeSOAP.retrieve = function (auth, uri, options, callback){
	if (!options.headers) {
		options.headers = {};
		options.headers.SOAPAction = "Retrieve";
	}
	
	FuelNodeSOAP(auth,uri,options,callback);
};


function _createEnvelope ( accessToken, body ) {
	var envelope = '';

	envelope += '<soapenv:Envelope xmlns:soapenv=\'http://schemas.xmlsoap.org/soap/envelope/\' xmlns:xsi=\'http://www.w3.org/2001/XMLSchema-instance\'>';
	envelope += '<soapenv:Header>';
	envelope += '<fueloauth xmlns=\'http://exacttarget.com\'>'+accessToken+'</fueloauth>';
	envelope += '</soapenv:Header>';
	envelope += '<soapenv:Body>';
	envelope += body;
	envelope += '</soapenv:Body>';
	envelope += '</soapenv:Envelope>';

	return envelope;
};

function _makeRequest(options, callback){
	request(options, function (error,response,body){
		if (error) {
			callback(error);
		} else {
			callback(error,response,body);
		}
	})
}

FuelNodeSOAP.version = version;