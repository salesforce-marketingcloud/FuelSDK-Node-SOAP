/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

var version     = require('../package.json').version;
var helpers     = require('./helpers');
var request     = require('request');
var xml2js      = require('xml2js');
var FuelAuth    = require('fuel-auth');

var clone         = require('lodash.clone');
var isEmpty       = require('lodash.isempty');
var isPlainObject = require('lodash.isplainobject');
var merge         = require('lodash.merge');

var parseString   = xml2js.parseString;

/**
 * @constructor FuelSoap
 * @param {Object} options - Configuration options
 * @param {Object} options.auth - Object containing information for auth client to initialize
 * @param {Object} [options.headers] - Object key/value pairs will add headers every request.
 * @param {String} [options.soapEndpoint=https://webservice.exacttarget.com/Service.asmx] - URL for designated SOAP web service
 * @returns {FuelSoap}
 */
var FuelSoap = function(options) {
	var authOptions = options && options.auth || {};

	// use fuel auth instance if applicable
	if(authOptions instanceof  FuelAuth) {
		this.AuthClient = authOptions;
	} else {
		try {
			this.AuthClient = new FuelAuth(authOptions);
		} catch (err) {
			throw err;
		}
	}

	this.version               = version;
	this.requestOptions        = {};
	this.requestOptions.uri    = options.soapEndpoint || 'https://webservice.exacttarget.com/Service.asmx';
	this.requestOptions.method = 'POST';
	this.globalReqOptions = options.globalReqOptions || {};

	this.defaultHeaders = merge({
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'text/xml'
	}, options.headers);
};


/**
 * This method handles the heavy lifing and is used by other SOAP Actions
 * @memberof FuelSoap
 * @param {Object} options - Configuration options
 * @param {String} options.action - Value that will be used as SOAPAction header
 * @param {Object} options.req - SOAP body to be sent prior to building the envelope
 * @param {Object} [options.reqOptions] - Options that will be passed into request module (actual API request)
 * @param {Object} [options.auth] - Options that will be passed to FuelAuth's getAccessToken function
 * @param {Boolean} [options.retry=false] - Whether or not request will retry if token is invalid
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.soapRequest = function(options, callback) {
	var requestOptions;

	if(typeof callback !== 'function') {
		throw new TypeError('callback argument is required');
	}

	if(!isPlainObject(options)) {
		throw new TypeError('options argument is required');
	}

	// shoudl probably replace with object.assign down the road
	requestOptions = merge(
		{}
		, this.globalReqOptions
		, this.requestOptions
		, { headers: this.defaultHeaders }
		, (options.reqOptions || {})
	);
	requestOptions.headers.SOAPAction = options.action;

	this.AuthClient.getAccessToken(clone(options.auth), function(err, body) {
		var localError, retry, authOptions;

		if(err) {
			callback(err, null);
			return;
		}

		if(!body.accessToken) {
			localError     = new Error('No access token');
			localError.res = body;
			callback(localError, null);
			return;
		}

		if(this.AuthClient.authVersion === 2 && body.soap_instance_url) {
			requestOptions.uri = body.soap_instance_url + 'Service.asmx';
		}

		retry       = options.retry || false;
		authOptions = clone(options.auth);

		delete options.retry;
		delete options.auth;

		requestOptions.body = this._buildEnvelope(options.req, body.accessToken);

		request(requestOptions, function(err, res, body) {
			if(err) {
				callback(err, null);
				return;
			}

			this._parseResponse(options.key, body, function(err, data) {
				if(err && helpers.checkExpiredToken(err) && retry) {
					options.auth = authOptions;
					this.soapRequest(options, callback);
					return;
				}

				if(err) {
					callback(err, null);
				} else {
					callback(null, { body: data, res: res });
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

/**
 * This method handles the Create SOAP Action
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} props - Value set in body as `CreateRequest.Objects`
 * @param {Object} [options] - Configuration options passed in body as `CreateRequest.Options`
 * @param {Boolean} [options.queryAllAccounts=false] - Sets `QueryAllAccounts = true` to body under `CreateRequest.Options`. **Note:** This value will be delete from body if used
 * @param {Object} [options.reqOptions] - Request options passed to soapRequest fn. **Note:** These will be delete from body if passed
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.create = function(type, props, options, callback) {
	var body;
	var reqOptions;
	var updateQueryAllAccounts;
	var optionsAndCallback;

	optionsAndCallback = determineCallbackAndOptions(arguments, callback, options);
	callback = optionsAndCallback.callback;
	options  = optionsAndCallback.options;

	updateQueryAllAccounts = configureQueryAllAccounts(options);
	if(isEmpty(options)) {
		options = null;
	}

	reqOptions = helpers.parseReqOptions(options);
	body = {
		CreateRequest: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, Options: options
			, Objects: props
		}
	};

	body.CreateRequest.Objects.$ = { 'xsi:type': type };

	updateQueryAllAccounts(body.CreateRequest, 'Options');

	this.soapRequest({
		action: 'Create'
		, req: body
		, key: 'CreateResponse'
		, retry: true
		, reqOptions: reqOptions
	}, callback);
};

/**
 * This method handles the Retrieve SOAP Action
 * It should be noted that type and callback are the only params required.
 * If **3 params** exist, function looks like `function(type, options, callback)`.
 * If **2 params** exist, function looks like `function(type, callback)`.
 * @memberof FuelSoap
 * @param {String} type - Will be used in body as `ObjectType` under `RetrieveRequestMsg.RetrieveRequest`
 * @param {Object} [props=['Client', 'ID', 'ObjectID']] - Value set in body as `RetrieveRequestMsg.RetrieveRequest.Properties`
 * @param {Object} [options] - Configuration options
 * @param {Object} [options.reqOptions] - Request options passed to soapRequest fn. **Note:** These will be delete from body if passed
 * @param [options.clientIDs] - Will be used in body as `ClientIDs` under `RetrieveRequestMsg.RetrieveRequest`
 * @param [options.filter] - Will be used in body as `Filter` under `RetrieveRequestMsg.RetrieveRequest`
 * @param [options.continueRequest] - Will be used in body as `ContinueRequest` under `RetrieveRequestMsg.RetrieveRequest`
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.retrieve = function(type, props, options, callback) {
	var body;
	var clientIDs    = null;
	var continueReq  = null;
	var defaultProps = ['Client', 'ID', 'ObjectID'];
	var filter       = null;
	var reqOptions;
	var updateQueryAllAccounts;

	if(arguments.length < 4) {
		//if props and options are not included
		if(typeof arguments[1] === 'function') {
			callback  = props;
			clientIDs = null;
			filter    = null;
			options   = null;
			props     = defaultProps;
		}

		//if props or options is included
		if(typeof arguments[2] === 'function') {
			callback = options;
			//check if props or filter
			if(isPlainObject(arguments[1])) {
				clientIDs = options.clientIDs; // this should really be props. thinking about removing all the complexity with different parameter ordering
				continueReq = options.continueRequest || props.continueRequest;
				filter = options.filter; // this should really be props
				props = defaultProps;
			} else {
				clientIDs = null;
				filter    = null;
				options   = null;
			}
		}
	} else {
		clientIDs = options.clientIDs;
		continueReq = options.continueRequest;
		filter    = options.filter;
	}

	updateQueryAllAccounts = configureQueryAllAccounts(options);
	reqOptions = helpers.parseReqOptions(options);
	body = {
		RetrieveRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, RetrieveRequest: {
				ObjectType: type
				, Properties: props
			}
		}
	};

	//TO-DO How to handle casing with properties?
	if(clientIDs) {
		body.RetrieveRequestMsg.RetrieveRequest.ClientIDs = clientIDs;
	}

	// filter can be simple or complex and has three properties leftOperand, rightOperand, and operator
	if(filter) {
		body.RetrieveRequestMsg.RetrieveRequest.Filter = this._parseFilter(filter);
	}

	updateQueryAllAccounts(body.RetrieveRequestMsg, 'RetrieveRequest');

	if(continueReq) {
		body.RetrieveRequestMsg.RetrieveRequest.ContinueRequest = continueReq;
	}

	this.soapRequest({
		action: 'Retrieve'
		, req: body
		, key: 'RetrieveResponseMsg'
		, retry: true
		, reqOptions: reqOptions
	}, callback);
};

/**
 * This method handles the Update SOAP Action
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} props - Value set in body as `UpdateRequest.Objects`
 * @param {Object} [options] - Configuration options passed in body as `UpdateRequest.Options`
 * @param {Boolean} [options.queryAllAccounts=false] - Sets `QueryAllAccounts = true` to body under `UpdateRequest.Options`. **Note:** This value will be delete from body if used
 * @param {Object} [options.reqOptions] - Request options passed to soapRequest fn. **Note:** These will be delete from body if passed
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.update = function(type, props, options, callback) {
	var body;
	var optionsAndCallback;
	var reqOptions;
	var updateQueryAllAccounts;

	optionsAndCallback = determineCallbackAndOptions(arguments, callback, options);
	callback = optionsAndCallback.callback;
	options  = optionsAndCallback.options;

	updateQueryAllAccounts = configureQueryAllAccounts(options);
	if(isEmpty(options)) {
		options = null;
	}

	reqOptions = helpers.parseReqOptions(options);
	body = {
		UpdateRequest: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, Options: options
			, Objects: props
		}
	};

	body.UpdateRequest.Objects.$ = { 'xsi:type': type };

	updateQueryAllAccounts(body.UpdateRequest, 'Options');

	this.soapRequest({
		action: 'Update'
		, req: body
		, key: 'UpdateResponse'
		, retry: true
		, reqOptions: reqOptions
	}, callback);
};

/**
 * This method handles the Delete SOAP Action
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} props - Value set in body as `DeleteRequest.Objects`
 * @param {Object} [options] - Configuration options passed in body as `DeleteRequest.Options`
 * @param {Boolean} [options.queryAllAccounts=false] - Sets `QueryAllAccounts = true` to body under `DeleteRequest.Options`. **Note:** This value will be delete from body if used
 * @param {Object} [options.reqOptions] - Request options passed to soapRequest fn. **Note:** These will be delete from body if passed
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.delete = function(type, props, options, callback) {
	var body;
	var optionsAndCallback;
	var reqOptions;
	var updateQueryAllAccounts;

	optionsAndCallback = determineCallbackAndOptions(arguments, callback, options);
	callback = optionsAndCallback.callback;
	options  = optionsAndCallback.options;

	updateQueryAllAccounts = configureQueryAllAccounts(options);
	if(isEmpty(options)) {
		options = null;
	}

	reqOptions = helpers.parseReqOptions(options);
	body = {
		DeleteRequest: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, Options: options
			, Objects: props
		}
	};

	body.DeleteRequest.Objects.$ = { 'xsi:type': type };

	updateQueryAllAccounts(body.DeleteRequest, 'Options');

	this.soapRequest({
		action: 'Delete'
		, req: body
		, key: 'DeleteResponse'
		, retry: true
		, reqOptions: reqOptions
	}, callback);
};

/**
 * This method handles the Describe SOAP Action
 * @memberof FuelSoap
 * @param {String} type - Will be used in body as `ObjectType` under `DefinitionRequestMsg.DescribeRequests.ObjectDefinitionRequest`
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.describe = function(type, callback) {
	var body = {
		DefinitionRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, DescribeRequests: {
				ObjectDefinitionRequest: {
					ObjectType: type
				}
			}
		}
	};

	this.soapRequest({
		action: 'Describe'
		, req: body
		, key: 'DefinitionResponseMsg'
		, retry: true
	}, callback);
};

/**
 * This method handles the Execute SOAP Actionf
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} props - Value set in body as `ExecuteRequestMsg.Requests.Parameters`
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.execute = function(type, props, callback) {
	var body = {
		ExecuteRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, Requests: {
				Name: type
				, Parameters: props
			}
		}
	};

	this.soapRequest({
		action: 'Execute'
		, req: body
		, key: 'ExecuteResponseMsg'
		, retry: true
	}, callback);
};

/**
 * This method handles the Perform SOAP Action
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} def - definition set in body as `PerformRequestMsg.Definitions.Definition`...only handles one def
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.perform = function(type, def, callback) {

	def.$ = { 'xsi:type': type }; //This limits us to one def at a time

	var body = {
		PerformRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			,
			"Action":"start",
			"Definitions": [
				{
					"Definition":def
				}
			]
		}
	};

	this.soapRequest({
		action: 'Perform'
		, req: body
		, key: 'PerformResponseMsg'
		, retry: true
	}, callback);
};

/**
 * This method builds the body of the request
 * @private
 * @memberof PrivateMethods
 * @param {Object} request - Body that will be transformed to XML for API request
 * @param {String} token - Access token supplied by `AuthClient`
 * @returns {Object} Builder object from xml2js module
 */
FuelSoap.prototype._buildEnvelope = function(request, token) {
	var builder;
	var envelope = {};

	envelope.Body = request;
	envelope.$ = {
		xmlns: 'http://schemas.xmlsoap.org/soap/envelope/',
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
	};
	envelope.Header = {
		fueloauth: {
			$: {
				xmlns: 'http://exacttarget.com'
			}
			, '_': token
		}
	};

	builder = new xml2js.Builder({
		rootName: 'Envelope'
		, headless: true
	});

	return builder.buildObject(envelope);
};

/**
 * This method parses a filter that will be passed into the body.
 * Will recursively create simple filters out of complex filters
 * @private
 * @memberof PrivateMethods
 * @param {Object|String} filter
 * @returns {Object}
 */
// TO-DO Handle other simple filter value types like DateValue
FuelSoap.prototype._parseFilter = function(filter) {
	var filterType = 'Simple';
	var obj = {};

	if(isObject(filter.leftOperand) && isObject(filter.rightOperand)) {
		filterType = 'Complex';
	}

	switch(filterType.toLowerCase()) {
		case 'simple':
			obj.Property       = filter.leftOperand;
			obj.SimpleOperator = filter.operator;
			obj.Value          = filter.rightOperand;
			break;
		case 'complex':
			obj.LeftOperand     = this._parseFilter(filter.leftOperand);
			obj.LogicalOperator = filter.operator;
			obj.RightOperand    = this._parseFilter(filter.rightOperand);
			break;
	}

	obj.$ = { 'xsi:type': filterType + "FilterPart" };

	return obj;
};

/**
 * This method parses a filter that will be passed into the body.
 * Will recursively create simple filters out of complex filters
 * @private
 * @memberof PrivateMethods
 * @param {String} key - Value used to determine where the response data is
 * @returns {Object} body - Data returned from API
 * @param {Function} callback - function responsible for delivering reponse
 */
FuelSoap.prototype._parseResponse = function(key, body, callback) {
	var parseOptions = {
		trim: true
		, normalize: true
		, explicitArray: false
		, ignoreAttrs: true
	};

	parseString(body, parseOptions, function(err, res) {
		if(err) {
			err.errorPropagatedFrom = 'xml2js.parseString';
			callback(err, null);
			return;
		}

		var soapError;
		var soapBody = res['soap:Envelope']['soap:Body'];

		// Check for SOAP Fault
		if(soapBody['soap:Fault']) {
			var fault             = soapBody['soap:Fault'];
			soapError             = new Error(fault.faultstring);
			soapError.faultstring = fault.faultstring;
			soapError.faultCode   = fault.faultcode;

			if(fault.detail) {
				soapError.detail = fault.detail;
			}

			soapError.errorPropagatedFrom = 'SOAP Fault';
			callback(soapError, null);
			return;
		}

		var parsedRes = soapBody[key];

		if(key === 'DefinitionResponseMsg') {
			// Return empty object if no ObjectDefinition is returned.
			parsedRes.ObjectDefinition = parsedRes.ObjectDefinition || {};
			callback(null, parsedRes);
			return;
		}

		// Results should always be an array
		parsedRes.Results = Array.isArray(parsedRes.Results) ? parsedRes.Results : isObject(parsedRes.Results) ? [parsedRes.Results] : [];

		if(key === 'RetrieveResponseMsg') {
			if(parsedRes.OverallStatus === 'OK' || parsedRes.OverallStatus === 'MoreDataAvailable') {
				callback(null, parsedRes);
			} else {
				// This is an error
				soapError = new Error(parsedRes.OverallStatus.split(':')[1].trim());
				soapError.requestId = parsedRes.RequestID;
				soapError.errorPropagatedFrom = 'Retrieve Response';
				callback(soapError, null);
			}
			return;
		}

		if(parsedRes.OverallStatus === 'Error' ||  parsedRes.OverallStatus === 'Has Errors') {
			soapError = new Error('Soap Error');
			soapError.requestId = parsedRes.RequestID;
			soapError.results = parsedRes.Results;
			soapError.errorPropagatedFrom = key;
			callback(soapError, null);
			return;
		}

		callback(null, parsedRes);
	}.bind(this));
};
/**
 * This method handles the Schedule SOAP Action
 * @memberof FuelSoap
 * @param {String} type - xsi:type
 * @param {Object} props - Value set in body as `ScheduleRequest.Objects`
 * @param {Object} [options] - Configuration options passed in body as `ScheduleRequest.Options`
 * @param {Boolean} [options.queryAllAccounts=false] - Sets `QueryAllAccounts = true` to body under `ScheduleRequest.Options`. **Note:** This value will be delete from body if used
 * @param {Object} [options.reqOptions] - Request options passed to soapRequest fn. **Note:** These will be delete from body if passed
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.schedule = function(type,schedule,interactions, action, options, callback) {
	var body;
	var optionsAndCallback;
	var reqOptions;
	var updateQueryAllAccounts;

	optionsAndCallback = determineCallbackAndOptions(arguments, callback, options);
	callback = optionsAndCallback.callback;
	options  = optionsAndCallback.options;

	updateQueryAllAccounts = configureQueryAllAccounts(options);
	if(isEmpty(options)) {
		options = null;
	}

	reqOptions = helpers.parseReqOptions(options);
	body = {
		ScheduleRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			, Action: action
			, Options: options
			, Schedule: schedule
			, Interactions: interactions
		}
	};

	if(Array.isArray(body.ScheduleRequestMsg.Interactions)){
		for(let i = 0; i < body.ScheduleRequestMsg.Interactions.length; i++){
			body.ScheduleRequestMsg.Interactions[0].Interaction.$ = {'xsi:type': type};
		 }
	} else if (typeof body.ScheduleRequestMsg.Interactions === "object") {
		body.ScheduleRequestMsg.Interactions.Interaction.$ = {'xsi:type': type};
	} else {
		throw new TypeError('Interactions must be of Array or Object Type');
	}

	updateQueryAllAccounts(body.ScheduleRequestMsg, 'Options');

	this.soapRequest({
		action: 'Schedule'
		, req: body
		, key: 'ScheduleResponseMsg'
		, retry: true
		, reqOptions: reqOptions
	}, callback);
};

/**
 * This method handles the Extract SOAP Action
 * @memberof FuelSoap
 * @param {Object} def - definition set in body as `ExtractRequestMsg.Requests`...
 * @param {FuelSoap~StandardCallback} callback - Callback that handles response
 */
FuelSoap.prototype.extract = function(def, callback) {

	var body = {
		ExtractRequestMsg: {
			$: {
				xmlns: 'http://exacttarget.com/wsdl/partnerAPI'
			}
			,
			"Requests": def
			/*
			{
				ID: "<GUID>",
				Parameters: {
					Parameter: [

						{
							Name: "<PARAM NAME>",
							Value: "<PARAM VALUE>"
						},
						...
					]
				}
			}
			*/
		}
	};

	this.soapRequest({
		action: 'Extract'
		, req: body
		, key: 'ExtractResponseMsg'
		, retry: true
	}, callback);
};

// Methods that need implementations
FuelSoap.prototype.configure = function() {};
FuelSoap.prototype.getSystemStatus = function() {};
FuelSoap.prototype.query = function() {};
FuelSoap.prototype.versionInfo = function() {};

function determineCallbackAndOptions(args, callback, options) {
	if(args.length < 4) {
		//if options are not included
		if(typeof args[2] === 'function') {
			callback = options;
			options = null;
		}
	}

	return {
		callback: callback
		, options: options
	};
}

function configureQueryAllAccounts(options) {
	var addQueryAllAccounts = false;

	if(options && options.queryAllAccounts) {
		addQueryAllAccounts = true;
		delete options.queryAllAccounts;
	}

	return function(rootElement, child) {
		if(addQueryAllAccounts) {
			rootElement[child] = rootElement[child] || {};
			rootElement[child].QueryAllAccounts = true;
		}
	};
}

function isObject(value) {
	var type = typeof value;
	return !!value && (type === 'object' || type === 'function');
}

module.exports = FuelSoap;

/**
 * This callback is displayed as part of the Requester class.
 * @callback FuelSoap~StandardCallback
 * @param {Object} error - error object as node standard
 * @param {Object} response - reponse object created from API request
 * @param {Object} response.body - Parsed XML response from API
 * @param {Object} response.res - Full response from API returned by request module
 */
