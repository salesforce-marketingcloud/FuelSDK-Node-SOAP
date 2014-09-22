Fuel SOAP Client (for Node.js)
=============

This library allows users access to ExactTarget's SOAP API at a low level.

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
    * `type` - object type **required**
    * `callback` - executed after task is completed. **required**
* **retrieve( type, props, filter, callback )**
    * `type` - object type. **required**
    * `props` - object properties to be returned **required**
    * `filter` - filter object
    * `callback` - executed after task is completed. **required**
* **create | update | delete( type, props, options, callback )**
    * `type` - object type **required**
    * `props` - object properties and values. **required**
    * `options` - options object
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
var filter = {
    leftOperand: 'Name'
    operator: 'equals'
    rightOperand: 'Test Email'
};

SoapClient.retrieve( 
    'Email', 
    ["ID", "Name", "Subject", "CategoryID", "EmailType"], 
    filter,
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