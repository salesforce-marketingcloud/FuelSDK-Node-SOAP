/**
* Copyright (c) 2014?, salesforce.com, inc.
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

var version     = require( '../package.json' ).version;
var helpers     = require( './helpers' );
var request     = require( 'request' );
var _           = require( 'lodash' );
var xml2js      = require( 'xml2js' );
var parseString = require( 'xml2js' ).parseString;
var FuelAuth    = require( 'fuel-auth' );


var FuelSoap = function (options) {
	var authOptions = options && options.auth || {};

	// use fuel auth instance if applicable
	if( authOptions instanceof  FuelAuth ) {
		this.AuthClient = authOptions;
	} else {
		try {
			this.AuthClient = new FuelAuth( authOptions );
		} catch ( err ) {
			throw err;
		}
	}

	// adding version to object
	this.version = version;

	// setting up default headers
	this.defaultHeaders = {
		'User-Agent': 'node-fuel/' + this.version,
		'Content-Type': 'text/xml'
	};

	// configuring soap options
	this.requestOptions = {};
	this.requestOptions.uri = options.soapEndpoint || 'https://webservice.exacttarget.com/Service.asmx';
	this.requestOptions.method = 'POST';
};

FuelSoap.prototype.soapRequest = function (options, callback) {
	// we need a callback
	if( !_.isFunction( callback ) ) {
		throw new TypeError( 'callback argument is required' );
	}

	// we need options
	if( !_.isPlainObject( options ) ) {
		throw new TypeError( 'options argument is required' );
	}

	var requestOptions = this.requestOptions;
	requestOptions.headers = this.defaultHeaders;
	requestOptions.headers.SOAPAction = options.action;

	this.AuthClient.getAccessToken( _.clone( options.auth ), function( err, body ) {
		var localError, retry, authOptions;

		if( err ) {
			helpers.deliverResponse( 'error', err, callback, 'FuelAuth' );
			return;
		}

		// if there's no access token we have a problem
		if ( !body.accessToken ) {
			localError = new Error( 'No access token' );
			localError.res = body;
			helpers.deliverResponse( 'error', localError, callback, 'FuelAuth' );
			return;
		}

		// retry request?
		retry       = options.retry || false;
		authOptions = _.clone( options.auth );

		// clean up
		delete options.retry;
		delete options.auth;

		var env = this._buildEnvelope(options.req, body.accessToken);
		console.log(env);
		requestOptions.body = env;

		request(requestOptions, function (err, res, body) {
			if (err) {
				helpers.deliverResponse( 'error', err, callback, 'Request Module inside soapRequest' );
				return;
			}

			// parse the response
			this._parseResponse( options.key, body, function(err, data) {
				if (err && helpers.checkExpiredToken(err) && retry) {
					options.auth = authOptions;
					this.soapRequest(options, callback);
					return;
				}

				if (err) {
					helpers.deliverResponse( 'error', err, callback );
				} else {
					helpers.deliverResponse( 'response', {body: data, res: res}, callback );
				}
			});
		}.bind( this ) );
	}.bind( this ) );
};

FuelSoap.prototype.create = function (type, props, options, callback) {

	if (arguments.length < 4) {
		//if options are not included
		if (Object.prototype.toString.call(arguments[2]) === "[object Function]") {
			callback = options;
			options = null;
		}
	}

	var body = {
		'CreateRequest': {
			'$': {
				'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
			},
			'Options': options
		}
	};

	body.CreateRequest.Objects = props;
	body.CreateRequest.Objects.$ = {
		'xsi:type': type
	};

	this.soapRequest({
		action: 'Create',
		req: body,
		key: 'CreateResponse',
		retry: true
	}, callback);
};

FuelSoap.prototype.retrieve = function (type, props, options, callback) {
	var defaultProps = ['Client', 'ID', 'ObjectID'];
	var filter = null;
	var clientIDs =  null;
	if (arguments.length < 4) {
		//if props and options are not included
		if (Object.prototype.toString.call(arguments[1]) === "[object Function]") {
			callback = props;
			filter = null;
			options = null;
			clientIDs = null;
			props = defaultProps;
		}

		//if props or options is included
		if (Object.prototype.toString.call(arguments[2]) === "[object Function]") {

			callback = options;
			//check if props or filter
			if (Object.prototype.toString.call(arguments[1]) === "[object Object]") {
				filter = options.filter;
				clientIDs = options.clientIDs;
				props = defaultProps;
			} else {
				filter = null;
				options = null;
				clientIDs =  null;
			}
		}
	}
	else {
		filter = options.filter;
		clientIDs = options.clientIDs;
	}

	//TO-DO How to handle casing with properties?
	if(clientIDs) {
		var body = {
			'RetrieveRequestMsg': {
				'$': {
					'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
				},
				'RetrieveRequest': {
					'ObjectType': type,
					'Properties': props,
					'ClientIDs': clientIDs
				}
			}
		};
	} else {
		var body = {
			'RetrieveRequestMsg': {
				'$': {
					'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
				},
				'RetrieveRequest': {
					'ObjectType': type,
					'Properties': props
				}
			}
		};
	}

	// filter can be simple or complex and has three properties leftOperand, rightOperand, and operator
	if (filter) {
		body.RetrieveRequestMsg.RetrieveRequest.Filter = this._parseFilter(filter);
	}

	this.soapRequest({
		action: 'Retrieve',
		req: body,
		key: 'RetrieveResponseMsg',
		retry: true
	}, callback);
};

// TO-DO Handle other simple filter value types like DateValue
FuelSoap.prototype._parseFilter = function(filter) {
	var fType = (_.isObject(filter.leftOperand) && _.isObject(filter.rightOperand)) ? "Complex" : "Simple";
	var obj = {
		'$': {
			'xsi:type': fType + "FilterPart"
		}
	};

	if (fType === "Complex") {
		obj.LeftOperand = this._parseFilter(filter.leftOperand);
		obj.LogicalOperator = filter.operator;
		obj.RightOperand = this._parseFilter(filter.rightOperand);
	} else {
		obj.Property = filter.leftOperand;
		obj.SimpleOperator = filter.operator;
		obj.Value = filter.rightOperand;
	}

	return obj;
};

FuelSoap.prototype.update = function (type, props, options, callback) {

	if (arguments.length < 4) {
		//if options are not included
		if (Object.prototype.toString.call(arguments[2]) === "[object Function]") {
			callback = options;
			options = null;
		}
	}

	var body = {
		'UpdateRequest': {
			'$': {
				'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
			},
			'Options': options
		}
	};

	body.UpdateRequest.Objects = props;
	body.UpdateRequest.Objects.$ = {
		'xsi:type': type
	};

	this.soapRequest({
		action: 'Update',
		req: body,
		key: 'UpdateResponse',
		retry: true
	}, callback);
};

FuelSoap.prototype.delete = function (type, props, options, callback) {

	if (arguments.length < 4) {
		//if options are not included
		if (Object.prototype.toString.call(arguments[2]) === "[object Function]") {
			callback = options;
			options = null;
		}
	}

	var body = {
		'DeleteRequest': {
			'$': {
				'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
			},
			'Options': options
		}
	};

	body.DeleteRequest.Objects = props;
	body.DeleteRequest.Objects.$ = {
		'xsi:type': type
	};

	this.soapRequest({
		action: 'Delete',
		req: body,
		key: 'DeleteResponse',
		retry: true
	}, callback);
};

FuelSoap.prototype.query = function () {

};

FuelSoap.prototype.describe = function (type, callback) {

	var body = {
		DefinitionRequestMsg: {
			'$': {
				'xmlns': 'http://exacttarget.com/wsdl/partnerAPI'
			},
			'DescribeRequests': {
				'ObjectDefinitionRequest': {
					'ObjectType': type
				}
			}
		}
	};

	this.soapRequest({
		action: 'Describe',
		req: body,
		key: 'DefinitionResponseMsg',
		retry: true
	}, callback);
};

FuelSoap.prototype.execute = function () {

};

FuelSoap.prototype.perform = function () {

};

FuelSoap.prototype.configure = function () {

};

FuelSoap.prototype.schedule = function () {

};

FuelSoap.prototype.versionInfo = function () {

};

FuelSoap.prototype.extract = function () {

};

FuelSoap.prototype.getSystemStatus = function () {

};

FuelSoap.prototype._buildEnvelope = function (request, token) {

	var envelope = {
		'$': {
			"xmlns": "http://schemas.xmlsoap.org/soap/envelope/",
			"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
		},
		'Header': {
			'fueloauth': {
				'$': {
					"xmlns": "http://exacttarget.com"
				},
				"_": token
			}
		},
		"Body": request
	};


	var buildOptions = {
		rootName: "Envelope",
		headless: true
	};

	var builder = new xml2js.Builder(buildOptions);
	return builder.buildObject(envelope);
};

FuelSoap.prototype._parseResponse = function(key, body, callback) {
	var parseOptions = {
		trim: true,
		normalize: true,
		explicitArray: false,
		ignoreAttrs: true
	};

	parseString(body, parseOptions, function (err, res) {

		if( err ) {
			err.errorPropagatedFrom = 'xml2js.parseString';
			callback( err, null );
			return;
		}

		var soapError;
		var soapBody = res['soap:Envelope']['soap:Body'];

		// Check for SOAP Fault
		if ( soapBody['soap:Fault']) {
			var fault = soapBody['soap:Fault'];
			soapError = new Error(fault.faultstring);
			soapError.faultstring = fault.faultstring;
			soapError.faultCode = fault.faultcode;
			if ( fault.detail ) {
				soapError.detail = fault.detail;
			}
			soapError.errorPropagatedFrom = 'SOAP Fault';
			callback( soapError, null );
			return;
		}

		var parsedRes = soapBody[key];

		if (key === 'DefinitionResponseMsg') {
			// Return empty object if no ObjectDefinition is returned.
			parsedRes.ObjectDefinition = parsedRes.ObjectDefinition || {};
			callback( null, parsedRes );
			return;
		}

		// Results should always be an array
		parsedRes.Results = _.isArray(parsedRes.Results) ? parsedRes.Results : _.isObject(parsedRes.Results) ? [parsedRes.Results] : [];

		if (key === 'RetrieveResponseMsg') {
			if ( parsedRes.OverallStatus === 'OK' || parsedRes.OverallStatus === 'MoreDataAvailable') {
				callback( null, parsedRes );
			} else {
				// This is an error
				console.log(parsedRes.OverallStatus.split(':')[1].trim());
				soapError = new Error(parsedRes.OverallStatus.split(':')[1].trim());
				soapError.requestId = parsedRes.RequestID;
				soapError.errorPropagatedFrom = 'Retrieve Response';
				callback( soapError, null );
			}
			return;
		}

		if ( parsedRes.OverallStatus === 'Error' ||  parsedRes.OverallStatus === 'Has Errors') {
			soapError = new Error('Soap Error');
			soapError.requestId = parsedRes.RequestID;
			soapError.results = parsedRes.Results;
			soapError.errorPropagatedFrom = key;
			callback( soapError, null );
			return;
		}

		callback( null, parsedRes );
	}.bind( this ) );
};

module.exports = FuelSoap;
