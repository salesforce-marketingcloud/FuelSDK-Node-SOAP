Fuel SOAP Client (for Node.js) [![Build Status](https://travis-ci.org/ExactTarget/Fuel-Node-SOAP.svg?branch=master)](https://travis-ci.org/ExactTarget/Fuel-Node-SOAP)
=============

This library allows users access to ExactTarget's SOAP API at a low level.

```
npm install fuel-soap --save
```

## Initialization

**new FuelSoap( options )** - Initialization

* `options.auth`
    * Required: yes
    * Type: `Object` or [FuelAuth Instance][1]
    * properties need to match [FuelAuth][1]
* `options.soapEndpoint`
    * Required: no
    * Type: `String`
    * Default: https://webservice.exacttarget.com/Service.asmx

## API

* **describe( type, callback )**
    * `type` - object type. [see object types](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/) **required**
    * `callback` - executed after task is completed. **required**
* **retrieve( type, props, options, callback )**
    * `type` - object type. [see object types](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/) **required**
    * `props` - object properties to be returned **required**
    * `options` - options object
    	* `options.filter` - filter object
    		* `filter.leftOperand` - property or filter object
    		* `filter.operator` - [Simple](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/simpleoperators/) or [Logical](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/logicaloperators/) operator
    		* `filter.rightOperand` - value or filter object
    * `callback` - executed after task is completed. **required**
* **create | update | delete( type, props, options, callback )**
    * `type` - object type. [see object types](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/) **required**
    * `props` - object properties and values. **required**
    * `options` - options object. [see method options](http://help.exacttarget.com/en/technical_library/web_service_guide/objects/options/)
    * `callback` - executed after task is completed. **required**

## Setting up the client

```js
var FuelSoap = require( 'fuel-soap' );
var options = {
    auth: {
        clientId: 'clientId'
        , clientSecret: 'clientSecret'
    }
    , soapEndpoint: 'https://webservice.s6.exacttarget.com/Service.asmx' // default --> https://webservice.exacttarget.com/Service.asmx
};

var SoapClient = new FuelSoap( options );
```


## Examples

```js
var options = {
	filter: {
		leftOperand: 'Name',
		operator: 'equals',
		rightOperand: 'Test Email'
	}
};

SoapClient.retrieve(
    'Email',
    ["ID", "Name", "Subject", "CategoryID", "EmailType"],
    options,
    function( err, response ) {
        if ( err ) {
            // error here
            console.log( err );
            return;
        }

        // response.body === parsed soap response (JSON)
        // response.res === full response from request client
        console.log( response.body );
    }
);
```
##Example with specifying business unit
```js
var options = {
	filter: {
		leftOperand: 'Name',
		operator: 'equals',
		rightOperand:  'Test Folder'
	},
	clientIDs: [{ID:12345}]
};

SoapClient.retrieve(
	'DataFolder',
	["ID"],
	options,
	function( err, response ) {
		if ( err ) {
			// error here
			console.log( err );
			return;
		}

		// response.body === parsed soap response (JSON)
		// response.res === full response from request client
		console.log(response.body);
	}
);
```

## Contributors

* Aydrian J. Howard - [twitter](https://twitter.com/aydrianh), [github](https://github.com/aydrian)
* Alex Vernacchia - [twitter](https://twitter.com/vernacchia), [github](https://github.com/vernak2539)
* Kelly Andrews - [twitter](https://twitter.com/kellyjandrews), [github](https://github.com/kellyjandrews)
* Jimmy Burgess - [github](https://github.com/jimmyburgess91)

## Contributing

Please checkout our [`.jshintrc`][2] file and follow the linting rules when contributing. In addition, this project uses **tabs** not spaces.

## ChangeLog

* **releases after v1 will have their notes in the 'releases' section**
* **1.0.0** - 2014-11-13
    * add original response to the callback - *breaking*
    * initial unit tests
* **0.1.0** - 2014-09-22 - 1st npm release

[1]: https://github.com/ExactTarget/Fuel-Node-Auth#initialization
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP/blob/master/.jshintrc
