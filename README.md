Fuel SOAP Client (for Node.js)
=============

This library allows users access to ExactTarget's SOAP API at a low level.

## Initialization

**new FuelSoap( options )** - Initialization

* *options.auth*
    * Required: yes
    * Type: `Object` or [FuelAuth Instance][1]
    * properties need to match [FuelAuth][1]
* *options.soapEndpoint*
    * Required: no
    * Type: `String`
    * Default: https://webservice.exacttarget.com/Service.asmx
    
## API

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
SoapClient.retrieve( 
    'Email', 
    ["ID", "Name", "Subject", "CategoryID", "EmailType"], 
    function( err, res ) {
        if ( err ) {
            // error here
            console.log( err );
        }
        
        console.log( res );
    }
);
```

[1]: https://github.com/ExactTarget/Fuel-Node-Auth#initialization