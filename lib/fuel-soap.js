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

	// try {
	// 	this.AuthClient = new FuelAuth(authOptions);
	// } catch (err) {
	// 	console.log(err);
	// 	return;
	// }

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

FuelSoap.prototype.retrieve = function () {

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
			$: {
				"xmlns": "http://exacttarget.com/wsdl/partnerAPI"
			},
			DescribeRequests: {
				ObjectDefinitionRequest: {
					ObjectType: type
				}
			}
		}
	};

	var env = this.buildEnvelope(body);

	this.makeRequest("Describe", env, function (err, res, body) {
		if (err) {
			callback(err)
		} else {
			self.handleRequest(body, function (res) {
				callback(res.DefinitionResponseMsg);
			})
		}

	})

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

FuelSoap.prototype.buildEnvelope = function (request) {

	var envelope = {
		'$': {
			"xmlns": "http://schemas.xmlsoap.org/soap/envelope/"
		},
		'Header': {
			'fueloauth': {
				'$': {
					"xmlns": "http://exacttarget.com"
				},
				"_": "wydcw6z3uqjwy5f23xeapmaa"
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


FuelSoap.prototype.makeRequest = function (action, body, callback) {

	var requestOptions = this.requestOptions;
	requestOptions.headers = this.defaultHeaders;
	requestOptions.headers.SOAPAction = action;
	requestOptions.body = body;

	request(requestOptions, function (error, response, body) {
		if (error) {
			callback(error);
		} else {
			callback(error, response, body);
		}
	});

}

FuelSoap.prototype.handleRequest = function (response, callback) {

	var parseOptions = {
		trim: true,
		normalize: true,
		explicitArray: false,
		ignoreAttrs: true
	};

	parseString(response, parseOptions, function (err, result) {
		callback(result['soap:Envelope']['soap:Body']);
	});
}



module.exports = FuelSoap;