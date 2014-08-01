var version = require('../package.json').version;
var request = require('request');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var url = require('url');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var FuelAuth = require('fuel-auth');


// var FuelSoap = function (authOptions, soapEndpoint) {
var FuelSoap = function (authOptions, soapEndpoint) {
	'use strict';

	try {
		this.AuthClient = new FuelAuth(authOptions);
	} catch (err) {
		console.log(err);
		return;
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
	this.requestOptions.uri = soapEndpoint || 'https://webservice.exacttarget.com/Service.asmx';
	this.requestOptions.method = 'POST';
};

// adding inheriting properties from EventEmitter
util.inherits(FuelSoap, EventEmitter);



FuelSoap.prototype.create = function () {
	console.log('create');
	return true;
}

FuelSoap.prototype.retrieve = function (type, props, filter, callback) {
	var self = this;
	var defaultProps = ['Client', 'ID', 'ObjectID'];

	if (arguments.length < 4) {
		//if props and filter are not included
		if (Object.prototype.toString.call(arguments[1]) == "[object Function]") {
			callback = props;
			filter = null;
			props = defaultProps;
		}

		//if props or filter is included
		if (Object.prototype.toString.call(arguments[2]) == "[object Function]") {

			callback = filter;
			//check if props or filter
			if (Object.prototype.toString.call(arguments[1]) == "[object Object]") {
				filter = props;
				props = defaultProps;
			} else {
				filter = null;
			}
		}
	}

	//TO-DO How to handle casing with properties?

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

	//TO-DO Rethink the filters - build as function for complex types?
	if (filter) {
		body.RetrieveRequestMsg.RetrieveRequest.Filter = {
			'$': {
				'xsi:type': 'SimpleFilterPart'
			},
			'Property': filter.property,
			'SimpleOperator': filter.operator,
			'Value': filter.value
		}
	}



	self.makeRequest("Retrieve", body, self.handleRequest("RetrieveResponseMsg", callback))

}

FuelSoap.prototype.update = function () {

}

FuelSoap.prototype.delete = function () {

}

FuelSoap.prototype.query = function () {

}

FuelSoap.prototype.describe = function (type, callback) {
	var self = this;

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

	self.makeRequest("Describe", body, self.handleRequest("DefinitionResponseMsg", callback))

}

FuelSoap.prototype.execute = function () {

}

FuelSoap.prototype.perform = function () {

}

FuelSoap.prototype.configure = function () {

}

FuelSoap.prototype.schedule = function () {

}

FuelSoap.prototype.versionInfo = function () {

}

FuelSoap.prototype.extract = function () {

}

FuelSoap.prototype.getSystemStatus = function () {

}

FuelSoap.prototype.buildEnvelope = function (request, token) {

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
	}


	var buildOptions = {
		rootName: "Envelope",
		headless: true
	}

	var builder = new xml2js.Builder(buildOptions);
	return builder.buildObject(envelope);
}


FuelSoap.prototype.makeRequest = function (action, req, callback) {
	var self = this;

	var requestOptions = this.requestOptions;
	requestOptions.headers = this.defaultHeaders;
	requestOptions.headers.SOAPAction = action;

	this.AuthClient.on('error', function (err) {
		console.log(err);
	});

	this.AuthClient.on('response', function (body) {

		var env = self.buildEnvelope(req, body.accessToken);
		console.log(env);
		requestOptions.body = env;

		request(requestOptions, function (err, res, body) {
			if (err) {
				callback(err, null, null);
			} else {
				callback(null, body);
			}
		});
	});

	this.AuthClient.getAccessToken();
}

FuelSoap.prototype.handleRequest = function (key, callback) {

	var parseOptions = {
		trim: true,
		normalize: true,
		explicitArray: false,
		ignoreAttrs: true
	};

	return function (err, body) {
		if (err) {
			callback(err);
		} else {
			parseString(body, parseOptions, function (err, res) {
				//TO-DO What other steps might need to be done here on return function?
				callback(res['soap:Envelope']['soap:Body'][key]);
			});
		}
	}
}



module.exports = FuelSoap;