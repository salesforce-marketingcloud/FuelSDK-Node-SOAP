Fuel SOAP Client (for Node.js)
=============

This library allows users access to ExactTarget's SOAP API at a low level.

## API

**new FuelSoap( authOptions, soapEndpoint )** - Initialization

* *authOptions*
    * required: yes
    * type: `Object`
    * properties need to match [FuelAuth Initialization][1]
* *soapEndpoint*
    * required: no
    * type: `String`
    * default: https://webservice.exacttarget.com/Service.asmx
    
### SOAP Methods

#### Methods

* **create( type, props, options, callback )**
* **retrieve( type, props, filter, callback )**
* **update( type, props, options, callback )**
* **delete( type, props, options, callback )**
* **query( )**
* **describe( type, callback )**
* **execute( )**
* **perform( )**
* **configure( )**
* **schedule( )**
* **versionInfo( )**
* **extract( )**
* **getSystemStatus( )**

## Setting up the client

```js
var FuelSoap = require( 'fuel-soap' );
var alternateEndpoint;

var SoapClient = new FuelSoap({
    clientId: 'clientId'
    , clientSecret: 'clientSecret'
}, alternateEndpoint );
```


## Examples

```js
SoapClient.retrieve( 
    'Email', 
    ["ID", "Name", "Subject", "CategoryID", "EmailType"], 
    function( response ) {
        console.log( response );
    }
);
```

[1]: https://github.com/ExactTarget/Fuel-Node-Auth#api